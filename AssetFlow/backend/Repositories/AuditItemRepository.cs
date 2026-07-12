// Repository implementation for AuditItem specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public class AuditItemRepository : BaseRepository<AuditItem>, IAuditItemRepository
{
    
    public AuditItemRepository(MongoDB.Driver.IMongoDatabase database) : base(database, "AuditItems") { }

}