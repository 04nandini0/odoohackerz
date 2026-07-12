using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IDepartmentRepository : IBaseRepository<Department>
{
    Task<Department?> FindByNameAsync(string name);
    Task<bool> HasChildrenAsync(string departmentId);
}