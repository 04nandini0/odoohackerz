using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IEmployeeRepository : IBaseRepository<Employee>
{
    Task<Employee?> FindByEmailAsync(string email);
    Task<Employee?> FindByRefreshTokenAsync(string refreshToken);
    Task<Employee?> FindByResetTokenAsync(string resetToken);
}