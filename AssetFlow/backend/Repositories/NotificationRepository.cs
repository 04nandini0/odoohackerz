using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;



public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    

    public NotificationRepository(IMongoDatabase database) : base(database, "Notifications")
    {
    }

    
    
    
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