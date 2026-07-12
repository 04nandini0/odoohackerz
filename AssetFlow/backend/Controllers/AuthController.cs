// API Controller handling HTTP requests for the Auth module.
using AssetFlow.DTOs;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        await _authService.SignupAsync(request);
        return Created("", new { message = "User registered successfully. Please login." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var response = await _authService.RefreshAsync(request);
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        await _authService.LogoutAsync(request);
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request);
        return Ok(new { message = "Password reset instructions have been sent to your email." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(new { message = "Password has been reset successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var user = new UserDto
        {
            Id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? "",
            Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value ?? "",
            Role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? "",
            Name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "",
            DepartmentId = User.FindFirst("departmentId")?.Value
        };
        
        return Ok(user);
    }
}

/*
Testing checklist:
- [ ] Signup rejects duplicate email
- [ ] Signup rejects weak password
- [ ] Signup ignores/rejects any role field in the payload
- [ ] Login fails with wrong password
- [ ] Login fails for Inactive employee
- [ ] Protected endpoint returns 401 with no token, 403 with wrong role
- [ ] Refresh token rotation works and old token is rejected after rotation
- [ ] Access token expires after 15 min and refresh flow correctly re-issues it
*/