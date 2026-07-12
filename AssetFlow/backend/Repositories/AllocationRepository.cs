using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;



public class AllocationRepository : BaseRepository<Allocation>, IAllocationRepository
{
    

    public AllocationRepository(IMongoDatabase database) : base(database, "Allocations")
    {
        
        // Database level backstop against double-allocation race conditions
        var indexKeysDefinition = Builders<Allocation>.IndexKeys.Ascending(a => a.AssetId);
        var filter = Builders<Allocation>.Filter.Eq(a => a.Status, AllocationStatus.Active);
        var indexOptions = new CreateIndexOptions
        {
            Unique = true
        };
        var indexModel = new CreateIndexModel<Allocation>(indexKeysDefinition, indexOptions);
        _collection.Indexes.CreateOne(indexModel);
    }

    
    
    

    public async Task<Allocation?> GetActiveByAssetIdAsync(string assetId)
    {
        return await _collection.Find(a => a.AssetId == assetId && a.Status == AllocationStatus.Active).FirstOrDefaultAsync();
    }
}