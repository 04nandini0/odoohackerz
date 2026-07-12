// Repository interface for Booking specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public interface IBookingRepository : IBaseRepository<Booking>
{
        Task<List<Booking>> GetActiveBookingsByAssetIdAsync(string assetId);
}