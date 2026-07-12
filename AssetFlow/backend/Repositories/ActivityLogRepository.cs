// Repository implementation for ActivityLog specific data operations.
using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;



public class ActivityLogRepository : BaseRepository<ActivityLog>, IActivityLogRepository
{
    

    public ActivityLogRepository(IMongoDatabase database) : base(database, "ActivityLogs")
    {
    }


}