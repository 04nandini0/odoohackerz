using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IAssetRepository : IBaseRepository<Asset>
{
    Task<bool> HasAssetsByDepartmentAsync(string departmentId);
    Task<bool> HasAssetsByCategoryAsync(string categoryId);
    Task<List<Asset>> SearchAssetsAsync(string? tag, string? serialNumber, string? categoryId, string? status, string? departmentId, string? location, string? search);
}