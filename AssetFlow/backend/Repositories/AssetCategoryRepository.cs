// Repository implementation for AssetCategory specific data operations.
using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public class AssetCategoryRepository : BaseRepository<AssetCategory>, IAssetCategoryRepository
{
    public AssetCategoryRepository(IMongoDatabase database) : base(database, "AssetCategories")
    {
    }

    public async Task<AssetCategory?> FindByNameAsync(string name)
    {
        return await _collection.Find(c => c.Name == name).FirstOrDefaultAsync();
    }
}