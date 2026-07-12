using AssetFlow.Models;

namespace AssetFlow.Services;

public interface IAssetLifecycleService
{
    Task TryTransitionAsync(string assetId, AssetStatus newStatus, string actorId, string? details = null);
}
