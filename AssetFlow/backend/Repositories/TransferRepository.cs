using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;



public class TransferRepository : BaseRepository<Transfer>, ITransferRepository
{
    

    public TransferRepository(IMongoDatabase database) : base(database, "Transfers")
    {
    }

    
    
    
}