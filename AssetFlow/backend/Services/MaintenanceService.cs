using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using System.ComponentModel.DataAnnotations;

namespace AssetFlow.Services;



public class MaintenanceService : IMaintenanceService
{
    private readonly IMaintenanceRepository _maintenanceRepository;
    private readonly IAssetLifecycleService _assetLifecycleService;
    private readonly INotificationService _notificationService;
    private readonly IActivityLogService _activityLogService;

    public MaintenanceService(
        IMaintenanceRepository maintenanceRepository,
        IAssetLifecycleService assetLifecycleService,
        INotificationService notificationService,
        IActivityLogService activityLogService)
    {
        _maintenanceRepository = maintenanceRepository;
        _assetLifecycleService = assetLifecycleService;
        _notificationService = notificationService;
        _activityLogService = activityLogService;
    }

    private void ValidateTransition(MaintenanceStatus current, MaintenanceStatus next)
    {
        var valid = (current, next) switch
        {
            (MaintenanceStatus.Pending, MaintenanceStatus.Approved) => true,
            (MaintenanceStatus.Pending, MaintenanceStatus.Rejected) => true,
            (MaintenanceStatus.Approved, MaintenanceStatus.TechnicianAssigned) => true,
            (MaintenanceStatus.TechnicianAssigned, MaintenanceStatus.InProgress) => true,
            (MaintenanceStatus.InProgress, MaintenanceStatus.Resolved) => true,
            _ => false
        };

        if (!valid)
            throw new InvalidOperationException($"Cannot move maintenance request from {current} to {next}");
    }

    public async Task<MaintenanceRequest> RaiseRequestAsync(CreateMaintenanceRequestDto dto, string currentUserId)
    {
        var request = new MaintenanceRequest
        {
            AssetId = dto.AssetId,
            RaisedBy = currentUserId,
            Issue = dto.Issue,
            Priority = dto.Priority,
            PhotoUrls = dto.PhotoUrls ?? new List<string>(),
            Status = MaintenanceStatus.Pending
        };

        await _maintenanceRepository.CreateAsync(request);
        await _activityLogService.LogAsync(currentUserId, "MaintenanceRequested", "MaintenanceRequest", request.Id);
        await _notificationService.BroadcastDashboardUpdateAsync();
        
        return request;
    }

    public async Task<MaintenanceRequest> ApproveAsync(string id, string currentUserId)
    {
        var request = await _maintenanceRepository.GetByIdAsync(id);
        if (request == null) throw new ArgumentException("Request not found");

        ValidateTransition(request.Status, MaintenanceStatus.Approved);
        
        request.Status = MaintenanceStatus.Approved;
        request.ApprovedBy = currentUserId;
        request.ApprovedAt = DateTime.UtcNow;

        await _maintenanceRepository.UpdateAsync(request.Id, request);

        // State Machine Rule: Flip asset to UnderMaintenance on approval
        await _assetLifecycleService.TryTransitionAsync(request.AssetId, AssetStatus.UnderMaintenance, currentUserId, $"Maintenance approved: {request.Issue}");

        await _notificationService.NotifyAsync(request.RaisedBy, NotificationType.MaintenanceApproved, "Your maintenance request has been approved.", "MaintenanceRequest", request.Id);
        await _activityLogService.LogAsync(currentUserId, "MaintenanceApproved", "MaintenanceRequest", request.Id);
        await _notificationService.BroadcastDashboardUpdateAsync();

        return request;
    }

    public async Task<MaintenanceRequest> RejectAsync(string id, RejectMaintenanceRequestDto dto, string currentUserId)
    {
        var request = await _maintenanceRepository.GetByIdAsync(id);
        if (request == null) throw new ArgumentException("Request not found");

        ValidateTransition(request.Status, MaintenanceStatus.Rejected);
        
        request.Status = MaintenanceStatus.Rejected;
        request.RejectionReason = dto.RejectionReason;
        request.ResolvedAt = DateTime.UtcNow;

        await _maintenanceRepository.UpdateAsync(request.Id, request);

        await _notificationService.NotifyAsync(request.RaisedBy, NotificationType.MaintenanceRejected, $"Your maintenance request was rejected: {dto.RejectionReason}", "MaintenanceRequest", request.Id);
        await _activityLogService.LogAsync(currentUserId, "MaintenanceRejected", "MaintenanceRequest", request.Id, new Dictionary<string, string> { { "Reason", dto.RejectionReason } });
        await _notificationService.BroadcastDashboardUpdateAsync();

        return request;
    }

    public async Task<MaintenanceRequest> AssignTechnicianAsync(string id, AssignTechnicianRequestDto dto, string currentUserId)
    {
        var request = await _maintenanceRepository.GetByIdAsync(id);
        if (request == null) throw new ArgumentException("Request not found");

        ValidateTransition(request.Status, MaintenanceStatus.TechnicianAssigned);
        
        request.Status = MaintenanceStatus.TechnicianAssigned;
        request.TechnicianId = dto.TechnicianId;

        await _maintenanceRepository.UpdateAsync(request.Id, request);
        await _activityLogService.LogAsync(currentUserId, "TechnicianAssigned", "MaintenanceRequest", request.Id, new Dictionary<string, string> { { "TechnicianId", dto.TechnicianId } });
        await _notificationService.BroadcastDashboardUpdateAsync();

        return request;
    }

    public async Task<MaintenanceRequest> StartAsync(string id, string currentUserId)
    {
        var request = await _maintenanceRepository.GetByIdAsync(id);
        if (request == null) throw new ArgumentException("Request not found");

        ValidateTransition(request.Status, MaintenanceStatus.InProgress);
        
        request.Status = MaintenanceStatus.InProgress;

        await _maintenanceRepository.UpdateAsync(request.Id, request);
        await _activityLogService.LogAsync(currentUserId, "MaintenanceStarted", "MaintenanceRequest", request.Id);
        await _notificationService.BroadcastDashboardUpdateAsync();

        return request;
    }

    public async Task<MaintenanceRequest> ResolveAsync(string id, ResolveMaintenanceRequestDto dto, string currentUserId)
    {
        var request = await _maintenanceRepository.GetByIdAsync(id);
        if (request == null) throw new ArgumentException("Request not found");

        ValidateTransition(request.Status, MaintenanceStatus.Resolved);
        
        request.Status = MaintenanceStatus.Resolved;
        request.ResolutionNotes = dto.ResolutionNotes;
        request.ResolvedAt = DateTime.UtcNow;

        await _maintenanceRepository.UpdateAsync(request.Id, request);

        // State Machine Rule: Flip asset back to Available on resolution
        await _assetLifecycleService.TryTransitionAsync(request.AssetId, AssetStatus.Available, currentUserId, $"Maintenance resolved: {dto.ResolutionNotes}");

        await _activityLogService.LogAsync(currentUserId, "MaintenanceResolved", "MaintenanceRequest", request.Id);
        await _notificationService.BroadcastDashboardUpdateAsync();

        return request;
    }
}