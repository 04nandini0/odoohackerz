// Repository interface for AssetCategory specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IAssetCategoryRepository : IBaseRepository<AssetCategory>
{
    Task<AssetCategory?> FindByNameAsync(string name);
}