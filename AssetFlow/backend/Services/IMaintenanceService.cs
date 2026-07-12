using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using System.ComponentModel.DataAnnotations;

namespace AssetFlow.Services;

public interface IMaintenanceService
{
    Task<MaintenanceRequest> RaiseRequestAsync(CreateMaintenanceRequestDto dto, string currentUserId);
    Task<MaintenanceRequest> ApproveAsync(string id, string currentUserId);
    Task<MaintenanceRequest> RejectAsync(string id, RejectMaintenanceRequestDto dto, string currentUserId);
    Task<MaintenanceRequest> AssignTechnicianAsync(string id, AssignTechnicianRequestDto dto, string currentUserId);
    Task<MaintenanceRequest> StartAsync(string id, string currentUserId);
    Task<MaintenanceRequest> ResolveAsync(string id, ResolveMaintenanceRequestDto dto, string currentUserId);
}
