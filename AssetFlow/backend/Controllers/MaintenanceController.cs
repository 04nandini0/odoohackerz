using AssetFlow.DTOs;
using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Repositories;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;
    private readonly IMaintenanceRepository _maintenanceRepository;

    public MaintenanceController(IMaintenanceService maintenanceService, IMaintenanceRepository maintenanceRepository)
    {
        _maintenanceService = maintenanceService;
        _maintenanceRepository = maintenanceRepository;
    }

    [HttpPost]
    public async Task<IActionResult> RaiseRequest([FromBody] CreateMaintenanceRequestDto dto)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.RaiseRequestAsync(dto, currentUserId);
        return Created("", request);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? assetId, [FromQuery] string? priority, [FromQuery] string? raisedBy)
    {
        var all = await _maintenanceRepository.GetAllAsync();
        var query = all.AsQueryable();

        if (!string.IsNullOrEmpty(assetId)) query = query.Where(m => m.AssetId == assetId);
        if (!string.IsNullOrEmpty(raisedBy)) query = query.Where(m => m.RaisedBy == raisedBy);
        
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<MaintenanceStatus>(status, true, out var parsedStatus))
            query = query.Where(m => m.Status == parsedStatus);
            
        if (!string.IsNullOrEmpty(priority) && Enum.TryParse<MaintenancePriority>(priority, true, out var parsedPriority))
            query = query.Where(m => m.Priority == parsedPriority);

        return Ok(query.ToList());
    }

    [HttpPut("{id}/approve")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager)]
    public async Task<IActionResult> Approve(string id)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.ApproveAsync(id, currentUserId);
        return Ok(request);
    }

    [HttpPut("{id}/reject")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager)]
    public async Task<IActionResult> Reject(string id, [FromBody] RejectMaintenanceRequestDto dto)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.RejectAsync(id, dto, currentUserId);
        return Ok(request);
    }

    [HttpPut("{id}/assign-technician")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager)]
    public async Task<IActionResult> AssignTechnician(string id, [FromBody] AssignTechnicianRequestDto dto)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.AssignTechnicianAsync(id, dto, currentUserId);
        return Ok(request);
    }

    [HttpPut("{id}/start")]
    public async Task<IActionResult> Start(string id)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.StartAsync(id, currentUserId);
        return Ok(request);
    }

    [HttpPut("{id}/resolve")]
    public async Task<IActionResult> Resolve(string id, [FromBody] ResolveMaintenanceRequestDto dto)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var request = await _maintenanceService.ResolveAsync(id, dto, currentUserId);
        return Ok(request);
    }

    [HttpGet("{assetId}/history")]
    public async Task<IActionResult> GetHistory(string assetId)
    {
        var all = await _maintenanceRepository.GetAllAsync();
        var history = all.Where(m => m.AssetId == assetId).OrderByDescending(m => m.RaisedAt).ToList();
        return Ok(history);
    }
}
/*
Testing checklist:
- [x] Maintenance approval correctly flips asset to UnderMaintenance and rejection does not
- [x] Resolving a request flips asset back to Available
- [x] Invalid maintenance transition (e.g. Resolved → Approved) returns 409
*/