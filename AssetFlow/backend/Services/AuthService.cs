using AssetFlow.Config;
using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AssetFlow.Services;

public class AuthService : IAuthService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IEmployeeRepository employeeRepository, IOptions<JwtSettings> jwtSettings)
    {
        _employeeRepository = employeeRepository;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task SignupAsync(SignupRequest request)
    {
        var existing = await _employeeRepository.FindByEmailAsync(request.Email);
        if (existing != null)
        {
            throw new Exception("Email is already in use.");
        }

        var employee = new Employee
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DepartmentId = request.DepartmentId,
            Role = EmployeeRole.Employee, // Explicitly set to Employee
            Status = EmployeeStatus.Active
        };

        await _employeeRepository.CreateAsync(employee);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var employee = await _employeeRepository.FindByEmailAsync(request.Email);
        if (employee == null || !BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
        {
            throw new Exception("Invalid email or password.");
        }

        if (employee.Status == EmployeeStatus.Inactive)
        {
            throw new UnauthorizedAccessException("Account deactivated, contact your administrator.");
        }

        var tokenPair = GenerateTokens(employee);
        
        employee.RefreshTokens.Add(tokenPair.RefreshTokenObj);
        await _employeeRepository.UpdateAsync(employee.Id, employee);

        return new AuthResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshTokenObj.Token,
            User = MapToUserDto(employee)
        };
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request)
    {
        var employee = await _employeeRepository.FindByRefreshTokenAsync(request.RefreshToken);
        if (employee == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        var existingToken = employee.RefreshTokens.FirstOrDefault(rt => rt.Token == request.RefreshToken);
        if (existingToken == null || !existingToken.IsActive)
        {
            throw new UnauthorizedAccessException("Refresh token is expired or revoked.");
        }

        if (employee.Status == EmployeeStatus.Inactive)
        {
            throw new UnauthorizedAccessException("Account deactivated.");
        }

        // Revoke old token
        existingToken.RevokedAt = DateTime.UtcNow;

        // Issue new tokens
        var tokenPair = GenerateTokens(employee);
        employee.RefreshTokens.Add(tokenPair.RefreshTokenObj);

        await _employeeRepository.UpdateAsync(employee.Id, employee);

        return new AuthResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshTokenObj.Token,
            User = MapToUserDto(employee)
        };
    }

    public async Task LogoutAsync(RefreshRequest request)
    {
        var employee = await _employeeRepository.FindByRefreshTokenAsync(request.RefreshToken);
        if (employee != null)
        {
            var existingToken = employee.RefreshTokens.FirstOrDefault(rt => rt.Token == request.RefreshToken);
            if (existingToken != null)
            {
                existingToken.RevokedAt = DateTime.UtcNow;
                await _employeeRepository.UpdateAsync(employee.Id, employee);
            }
        }
    }

    public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var employee = await _employeeRepository.FindByEmailAsync(request.Email);
        if (employee == null)
        {
            // Do not reveal that the user does not exist
            return string.Empty;
        }

        // Generate a simple token for demo purposes. In production, this should be cryptographically secure and hashed.
        var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        
        employee.ResetPasswordToken = resetToken; // Usually store a hash of this!
        employee.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
        
        await _employeeRepository.UpdateAsync(employee.Id, employee);

        // TODO: In production, email this token instead of returning it!
        return resetToken;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var employee = await _employeeRepository.FindByResetTokenAsync(request.ResetToken);
        
        if (employee == null || employee.ResetPasswordTokenExpiry < DateTime.UtcNow)
        {
            throw new Exception("Invalid or expired reset token.");
        }

        employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        employee.ResetPasswordToken = null;
        employee.ResetPasswordTokenExpiry = null;

        await _employeeRepository.UpdateAsync(employee.Id, employee);
    }

    private (string AccessToken, RefreshToken RefreshTokenObj) GenerateTokens(Employee employee)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
        
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, employee.Id),
            new Claim(JwtRegisteredClaimNames.Email, employee.Email),
            new Claim(ClaimTypes.Role, employee.Role.ToString())
        };

        if (!string.IsNullOrEmpty(employee.DepartmentId))
        {
            claims.Add(new Claim("departmentId", employee.DepartmentId));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(15),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(token);

        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        return (accessToken, refreshToken);
    }

    private UserDto MapToUserDto(Employee employee)
    {
        return new UserDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Role = employee.Role.ToString(),
            DepartmentId = employee.DepartmentId
        };
    }
}