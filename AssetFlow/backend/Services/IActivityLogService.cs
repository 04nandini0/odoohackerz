using AssetFlow.Models;

namespace AssetFlow.Services;

public interface IActivityLogService
{
    Task LogAsync(string userId, string action, string entityType, string entityId, Dictionary<string, string>? details = null);
}
