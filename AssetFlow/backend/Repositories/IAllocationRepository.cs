// Repository interface for Allocation specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IAllocationRepository : IBaseRepository<Allocation>
{
        Task<Allocation?> GetActiveByAssetIdAsync(string assetId);
}