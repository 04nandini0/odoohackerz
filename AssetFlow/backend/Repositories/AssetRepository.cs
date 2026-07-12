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

    public async Task<List<Asset>> SearchAssetsAsync(string? tag, string? serialNumber, string? categoryId, string? status, string? departmentId, string? location, string? search)
    {
        var filterBuilder = Builders<Asset>.Filter;
        var filter = filterBuilder.Empty;

        if (!string.IsNullOrEmpty(tag))
            filter &= filterBuilder.Eq(a => a.Tag, tag);
        if (!string.IsNullOrEmpty(serialNumber))
            filter &= filterBuilder.Eq(a => a.SerialNumber, serialNumber);
        if (!string.IsNullOrEmpty(categoryId))
            filter &= filterBuilder.Eq(a => a.CategoryId, categoryId);
        if (!string.IsNullOrEmpty(departmentId))
            filter &= filterBuilder.Eq(a => a.DepartmentId, departmentId);
        if (!string.IsNullOrEmpty(location))
            filter &= filterBuilder.Regex(a => a.Location, new MongoDB.Bson.BsonRegularExpression(location, "i"));
        
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<AssetStatus>(status, true, out var parsedStatus))
            filter &= filterBuilder.Eq(a => a.Status, parsedStatus);

        if (!string.IsNullOrEmpty(search))
        {
            var searchRegex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            var searchFilter = filterBuilder.Or(
                filterBuilder.Regex(a => a.Name, searchRegex),
                filterBuilder.Regex(a => a.Tag, searchRegex),
                filterBuilder.Regex(a => a.SerialNumber, searchRegex)
            );
            filter &= searchFilter;
        }

        return await _collection.Find(filter).ToListAsync();
    }
}