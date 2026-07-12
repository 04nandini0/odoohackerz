using MongoDB.Driver;
// Repository interface for Notification specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface INotificationRepository : IBaseRepository<Notification>
{
        Task<List<Notification>> GetByUserIdAsync(string userId, bool unreadOnly);
    Task UpdateManyAsync(FilterDefinition<Notification> filter, UpdateDefinition<Notification> update);
}