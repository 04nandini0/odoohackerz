using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface IBookingRepository
{
    Task CreateAsync(Booking booking);
    Task<Booking?> GetByIdAsync(string id);
    Task UpdateAsync(string id, Booking booking);
    Task<List<Booking>> GetAllAsync();
    Task<List<Booking>> GetActiveBookingsByAssetIdAsync(string assetId);
}

public class BookingRepository : IBookingRepository
{
    private readonly IMongoCollection<Booking> _collection;

    public BookingRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Booking>("Bookings");
    }

    public async Task CreateAsync(Booking booking) => await _collection.InsertOneAsync(booking);
    
    public async Task<Booking?> GetByIdAsync(string id) => await _collection.Find(b => b.Id == id).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, Booking booking) => await _collection.ReplaceOneAsync(b => b.Id == id, booking);
    
    public async Task<List<Booking>> GetAllAsync() => await _collection.Find(_ => true).ToListAsync();

    public async Task<List<Booking>> GetActiveBookingsByAssetIdAsync(string assetId)
    {
        return await _collection.Find(b => 
            b.ResourceAssetId == assetId && 
            (b.Status == BookingStatus.Upcoming || b.Status == BookingStatus.Ongoing)
        ).ToListAsync();
    }
}