// Service interface defining business logic for the Auth module.
using AssetFlow.DTOs;

namespace AssetFlow.Services;

public interface IAuthService
{
    Task SignupAsync(SignupRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(RefreshRequest request);
    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}