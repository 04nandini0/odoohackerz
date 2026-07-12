// Repository implementation for MaintenanceRequest specific data operations.
using AssetFlow.Models;

namespace AssetFlow.Repositories;

public class MaintenanceRequestRepository : BaseRepository<MaintenanceRequest>, IMaintenanceRequestRepository
{
    
    public MaintenanceRequestRepository(MongoDB.Driver.IMongoDatabase database) : base(database, "MaintenanceRequests") { }

}