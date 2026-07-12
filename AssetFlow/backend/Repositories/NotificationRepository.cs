using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface INotificationRepository
{
    Task CreateAsync(Notification notification);
    Task<Notification?> GetByIdAsync(string id);
    Task UpdateAsync(string id, Notification notification);
    Task<List<Notification>> GetByUserIdAsync(string userId, bool unreadOnly);
    Task UpdateManyAsync(FilterDefinition<Notification> filter, UpdateDefinition<Notification> update);
}

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _collection;

    public NotificationRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Notification>("Notifications");
    }

    public async Task CreateAsync(Notification notification) => await _collection.InsertOneAsync(notification);
    
    public async Task<Notification?> GetByIdAsync(string id) => await _collection.Find(n => n.Id == id).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, Notification notification) => await _collection.ReplaceOneAsync(n => n.Id == id, notification);
    
    public async Task<List<Notification>> GetByUserIdAsync(string userId, bool unreadOnly)
    {
        var builder = Builders<Notification>.Filter;
        var filter = builder.Eq(n => n.UserId, userId);
        if (unreadOnly)
        {
            filter &= builder.Eq(n => n.Read, false);
        }
        return await _collection.Find(filter).SortByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task UpdateManyAsync(FilterDefinition<Notification> filter, UpdateDefinition<Notification> update)
    {
        await _collection.UpdateManyAsync(filter, update);
    }
}