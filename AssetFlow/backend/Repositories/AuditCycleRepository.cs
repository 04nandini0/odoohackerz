// Repository implementation for AuditCycle specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public class AuditCycleRepository : BaseRepository<AuditCycle>, IAuditCycleRepository
{
    
    public AuditCycleRepository(MongoDB.Driver.IMongoDatabase database) : base(database, "AuditCycles") { }

}