using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface IMaintenanceRepository
{
    Task CreateAsync(MaintenanceRequest request);
    Task<MaintenanceRequest?> GetByIdAsync(string id);
    Task UpdateAsync(string id, MaintenanceRequest request);
    Task<List<MaintenanceRequest>> GetAllAsync();
}

public class MaintenanceRepository : IMaintenanceRepository
{
    private readonly IMongoCollection<MaintenanceRequest> _collection;

    public MaintenanceRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<MaintenanceRequest>("MaintenanceRequests");
    }

    public async Task CreateAsync(MaintenanceRequest request) => await _collection.InsertOneAsync(request);
    
    public async Task<MaintenanceRequest?> GetByIdAsync(string id) => await _collection.Find(m => m.Id == id).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, MaintenanceRequest request) => await _collection.ReplaceOneAsync(m => m.Id == id, request);
    
    public async Task<List<MaintenanceRequest>> GetAllAsync() => await _collection.Find(_ => true).ToListAsync();
}
