// Repository implementation for Asset specific data operations.
using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public class AssetRepository : BaseRepository<Asset>, IAssetRepository
{
    public AssetRepository(IMongoDatabase database) : base(database, "Assets")
    {
    }

    public async Task<bool> HasAssetsByDepartmentAsync(string departmentId)
    {
        var asset = await _collection.Find(a => a.DepartmentId == departmentId && a.Status != AssetStatus.Disposed).FirstOrDefaultAsync();
        return asset != null;
    }

    public async Task<bool> HasAssetsByCategoryAsync(string categoryId)
    {
        var asset = await _collection.Find(a => a.CategoryId == categoryId && a.Status != AssetStatus.Disposed).FirstOrDefaultAsync();
        return asset != null;
    }
}