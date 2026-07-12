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
public class AllocationsController : ControllerBase
{
    private readonly IAllocationService _allocationService;
    private readonly IAllocationRepository _allocationRepository;

    public AllocationsController(IAllocationService allocationService, IAllocationRepository allocationRepository)
    {
        _allocationService = allocationService;
        _allocationRepository = allocationRepository;
    }

    [HttpPost]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead)]
    public async Task<IActionResult> Allocate([FromBody] CreateAllocationRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var allocation = await _allocationService.AllocateAsync(request, currentUserId);
        return Created("", allocation);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? assetId, [FromQuery] string? holderId, [FromQuery] string? status, [FromQuery] bool overdue = false)
    {
        var all = await _allocationRepository.GetAllAsync();
        var query = all.AsQueryable();

        if (!string.IsNullOrEmpty(assetId)) query = query.Where(a => a.AssetId == assetId);
        if (!string.IsNullOrEmpty(holderId)) query = query.Where(a => a.HolderId == holderId);
        
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<AllocationStatus>(status, true, out var parsedStatus))
            query = query.Where(a => a.Status == parsedStatus);

        if (overdue)
            query = query.Where(a => a.Status == AllocationStatus.Active && a.ExpectedReturnDate.HasValue && a.ExpectedReturnDate.Value < DateTime.UtcNow);

        return Ok(query.ToList());
    }

    [HttpPost("{id}/return")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead)]
    public async Task<IActionResult> Return(string id, [FromBody] ReturnAllocationRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var returned = await _allocationService.ReturnAsync(id, request, currentUserId);
        return Ok(returned);
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue()
    {
        var all = await _allocationRepository.GetAllAsync();
        var overdue = all.Where(a => a.Status == AllocationStatus.Active && a.ExpectedReturnDate.HasValue && a.ExpectedReturnDate.Value < DateTime.UtcNow).ToList();
        return Ok(overdue);
    }
}
/*
Testing checklist:
- [x] Allocating an already-allocated asset returns structured 409 with correct holder info
- [x] Two concurrent allocation requests for the same asset — only one succeeds (test with parallel requests, verify the DB unique index catches it even if the app-level check races)
- [x] Overdue allocations correctly surface via GET /api/allocations/overdue
*/