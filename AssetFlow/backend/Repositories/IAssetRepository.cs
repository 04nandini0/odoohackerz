using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IAssetRepository : IBaseRepository<Asset>
{
    Task<bool> HasAssetsByDepartmentAsync(string departmentId);
    Task<bool> HasAssetsByCategoryAsync(string categoryId);
}\n