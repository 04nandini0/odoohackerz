using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface IAllocationRepository
{
    Task CreateAsync(Allocation allocation);
    Task<Allocation?> GetByIdAsync(string id);
    Task UpdateAsync(string id, Allocation allocation);
    Task<List<Allocation>> GetAllAsync();
    Task<Allocation?> GetActiveByAssetIdAsync(string assetId);
}

public class AllocationRepository : IAllocationRepository
{
    private readonly IMongoCollection<Allocation> _collection;

    public AllocationRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Allocation>("Allocations");
        
        // Database level backstop against double-allocation race conditions
        var indexKeysDefinition = Builders<Allocation>.IndexKeys.Ascending(a => a.AssetId);
        var filter = Builders<Allocation>.Filter.Eq(a => a.Status, AllocationStatus.Active);
        var indexOptions = new CreateIndexOptions
        {
            Unique = true,
            PartialFilterExpression = filter
        };
        var indexModel = new CreateIndexModel<Allocation>(indexKeysDefinition, indexOptions);
        _collection.Indexes.CreateOne(indexModel);
    }

    public async Task CreateAsync(Allocation allocation) => await _collection.InsertOneAsync(allocation);
    
    public async Task<Allocation?> GetByIdAsync(string id) => await _collection.Find(a => a.Id == id).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, Allocation allocation) => await _collection.ReplaceOneAsync(a => a.Id == id, allocation);
    
    public async Task<List<Allocation>> GetAllAsync() => await _collection.Find(_ => true).ToListAsync();

    public async Task<Allocation?> GetActiveByAssetIdAsync(string assetId)
    {
        return await _collection.Find(a => a.AssetId == assetId && a.Status == AllocationStatus.Active).FirstOrDefaultAsync();
    }
}