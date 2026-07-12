using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(IMongoDatabase database) : base(database, "Departments")
    {
    }

    public async Task<Department?> FindByNameAsync(string name)
    {
        return await _collection.Find(d => d.Name == name).FirstOrDefaultAsync();
    }

    public async Task<bool> HasChildrenAsync(string departmentId)
    {
        var child = await _collection.Find(d => d.ParentDepartmentId == departmentId && d.Status == DepartmentStatus.Active).FirstOrDefaultAsync();
        return child != null;
    }
}