using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;

    public ActivityLogService(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task LogAsync(string userId, string action, string entityType, string entityId, Dictionary<string, string>? details = null)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details ?? new Dictionary<string, string>(),
            Timestamp = DateTime.UtcNow
        };

        // Note: The original ActivityLogRepository might need to be adjusted if it was strongly typed to the old entity properties
        await _activityLogRepository.CreateAsync(log);
    }
}
