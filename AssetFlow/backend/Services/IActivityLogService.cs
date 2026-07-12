namespace AssetFlow.Services;

public interface IActivityLogService
{
    Task LogAsync(string action, string description, string? performedByEmployeeId = null, string? targetEntityId = null, string? details = null);
}
