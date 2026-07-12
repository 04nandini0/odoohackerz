// Repository implementation for ActivityLog specific data operations.
using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface IActivityLogRepository
{
    Task CreateAsync(ActivityLog log);
    Task<List<ActivityLog>> GetAllAsync();
}

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly IMongoCollection<ActivityLog> _collection;

    public ActivityLogRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<ActivityLog>("ActivityLogs");
    }

    public async Task CreateAsync(ActivityLog log) => await _collection.InsertOneAsync(log);

    public async Task<List<ActivityLog>> GetAllAsync() => await _collection.Find(_ => true).ToListAsync();
}