using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public class InvalidTransitionException : Exception
{
    public InvalidTransitionException(string message) : base(message) { }
}

public class AssetLifecycleService : IAssetLifecycleService
{
    private readonly IAssetRepository _assetRepository;
    private readonly IActivityLogService _activityLogService;

    // Transition matrix defining allowed state changes
    private static readonly Dictionary<AssetStatus, HashSet<AssetStatus>> AllowedTransitions = new()
    {
        { AssetStatus.Available, new HashSet<AssetStatus> { AssetStatus.Allocated, AssetStatus.Reserved, AssetStatus.UnderMaintenance, AssetStatus.Lost, AssetStatus.Retired } },
        { AssetStatus.Allocated, new HashSet<AssetStatus> { AssetStatus.Available, AssetStatus.UnderMaintenance, AssetStatus.Lost } },
        { AssetStatus.Reserved, new HashSet<AssetStatus> { AssetStatus.Available, AssetStatus.Allocated } },
        { AssetStatus.UnderMaintenance, new HashSet<AssetStatus> { AssetStatus.Available, AssetStatus.Retired, AssetStatus.Disposed } },
        { AssetStatus.Lost, new HashSet<AssetStatus> { AssetStatus.Available, AssetStatus.Disposed } },
        { AssetStatus.Retired, new HashSet<AssetStatus> { AssetStatus.Disposed } },
        { AssetStatus.Disposed, new HashSet<AssetStatus>() } // Terminal state
    };

    public AssetLifecycleService(IAssetRepository assetRepository, IActivityLogService activityLogService)
    {
        _assetRepository = assetRepository;
        _activityLogService = activityLogService;
    }

    /// <summary>
    /// This service is intended to be called by cross-module dependencies (Allocation, Maintenance, Audit).
    /// Modules MUST call TryTransitionAsync instead of mutating Asset.Status themselves to ensure state consistency and auditing.
    /// </summary>
    public async Task TryTransitionAsync(string assetId, AssetStatus newStatus, string actorId, string? details = null)
    {
        var asset = await _assetRepository.GetByIdAsync(assetId);
        if (asset == null)
            throw new ArgumentException("Asset not found");

        var currentStatus = asset.Status;

        if (currentStatus == newStatus)
            return; // No-op if already in that state

        if (!AllowedTransitions.TryGetValue(currentStatus, out var allowedNextStates) || !allowedNextStates.Contains(newStatus))
        {
            throw new InvalidTransitionException($"Cannot move asset from {currentStatus} to {newStatus}");
        }

        asset.Status = newStatus;
        asset.UpdatedAt = DateTime.UtcNow;

        await _assetRepository.UpdateAsync(asset.Id, asset);

        await _activityLogService.LogAsync(
            action: "AssetStatusChanged",
            description: $"Asset {asset.Tag} status changed from {currentStatus} to {newStatus}",
            performedByEmployeeId: actorId,
            targetEntityId: asset.Id,
            details: details
        );
    }
}
