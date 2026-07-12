using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(IMongoDatabase database) : base(database, "Employees")
    {
    }

    public async Task<Employee?> FindByEmailAsync(string email)
    {
        return await _collection.Find(e => e.Email == email).FirstOrDefaultAsync();
    }

    public async Task<Employee?> FindByRefreshTokenAsync(string refreshToken)
    {
        return await _collection.Find(e => e.RefreshTokens.Any(rt => rt.Token == refreshToken)).FirstOrDefaultAsync();
    }

    public async Task<Employee?> FindByResetTokenAsync(string resetToken)
    {
        return await _collection.Find(e => e.ResetPasswordToken == resetToken).FirstOrDefaultAsync();
    }
}