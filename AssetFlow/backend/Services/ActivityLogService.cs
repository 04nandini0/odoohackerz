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

    public async Task LogAsync(string action, string description, string? performedByEmployeeId = null, string? targetEntityId = null, string? details = null)
    {
        var log = new ActivityLog
        {
            Action = action,
            Description = description,
            PerformedByEmployeeId = performedByEmployeeId,
            TargetEntityId = targetEntityId,
            Details = details,
            Timestamp = DateTime.UtcNow
        };

        await _activityLogRepository.CreateAsync(log);
    }
}
