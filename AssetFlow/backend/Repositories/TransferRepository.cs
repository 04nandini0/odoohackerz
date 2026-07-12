using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface ITransferRepository
{
    Task CreateAsync(Transfer transfer);
    Task<Transfer?> GetByIdAsync(string id);
    Task UpdateAsync(string id, Transfer transfer);
    Task<List<Transfer>> GetAllAsync();
}

public class TransferRepository : ITransferRepository
{
    private readonly IMongoCollection<Transfer> _collection;

    public TransferRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Transfer>("Transfers");
    }

    public async Task CreateAsync(Transfer transfer) => await _collection.InsertOneAsync(transfer);
    
    public async Task<Transfer?> GetByIdAsync(string id) => await _collection.Find(t => t.Id == id).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, Transfer transfer) => await _collection.ReplaceOneAsync(t => t.Id == id, transfer);
    
    public async Task<List<Transfer>> GetAllAsync() => await _collection.Find(_ => true).ToListAsync();
}