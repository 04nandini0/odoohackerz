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
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;
    private readonly ITransferRepository _transferRepository;

    public TransfersController(ITransferService transferService, ITransferRepository transferRepository)
    {
        _transferService = transferService;
        _transferRepository = transferRepository;
    }

    [HttpPost]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead, EmployeeRole.Employee)]
    public async Task<IActionResult> RequestTransfer([FromBody] CreateTransferRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var transfer = await _transferService.RequestTransferAsync(request, currentUserId);
        return Created("", transfer);
    }

    [HttpPut("{id}/approve")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead)]
    public async Task<IActionResult> ApproveTransfer(string id)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var transfer = await _transferService.ApproveTransferAsync(id, currentUserId);
        return Ok(transfer);
    }

    [HttpPut("{id}/reject")]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead)]
    public async Task<IActionResult> RejectTransfer(string id, [FromBody] RejectTransferRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var transfer = await _transferService.RejectTransferAsync(id, request, currentUserId);
        return Ok(transfer);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? assetId)
    {
        var all = await _transferRepository.GetAllAsync();
        var query = all.AsQueryable();

        if (!string.IsNullOrEmpty(assetId)) query = query.Where(t => t.AssetId == assetId);
        
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<TransferStatus>(status, true, out var parsedStatus))
            query = query.Where(t => t.Status == parsedStatus);

        return Ok(query.ToList());
    }
}
/*
Testing checklist:
- [x] Transfer approval is atomic — simulate a failure mid-transaction and confirm no orphaned state
*/
