using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;



public class BookingRepository : BaseRepository<Booking>, IBookingRepository
{
    

    public BookingRepository(IMongoDatabase database) : base(database, "Bookings")
    {
    }

    
    
    

    public async Task<List<Booking>> GetActiveBookingsByAssetIdAsync(string assetId)
    {
        return await _collection.Find(b => 
            b.ResourceAssetId == assetId && 
            (b.Status == BookingStatus.Upcoming || b.Status == BookingStatus.Ongoing)
        ).ToListAsync();
    }
}