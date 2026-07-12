using AssetFlow.DTOs;
using AssetFlow.Exceptions;
using AssetFlow.Models;
using AssetFlow.Repositories;
using MongoDB.Driver;

namespace AssetFlow.Services;

public interface IAllocationService
{
    Task<Allocation> AllocateAsync(CreateAllocationRequest request, string currentUserId);
    Task<Allocation> ReturnAsync(string allocationId, ReturnAllocationRequest request, string currentUserId);
}

public class AllocationService : IAllocationService
{
    private readonly IAllocationRepository _allocationRepository;
    private readonly IAssetLifecycleService _lifecycleService;
    private readonly IEmployeeDirectoryService _employeeService;
    private readonly IDepartmentService _departmentService;

    public AllocationService(
        IAllocationRepository allocationRepository, 
        IAssetLifecycleService lifecycleService,
        IEmployeeDirectoryService employeeService,
        IDepartmentService departmentService)
    {
        _allocationRepository = allocationRepository;
        _lifecycleService = lifecycleService;
        _employeeService = employeeService;
        _departmentService = departmentService;
    }

    private async Task<string> GetHolderNameAsync(string holderId, HolderType type)
    {
        if (type == HolderType.Employee)
        {
            var emp = await _employeeService.GetEmployeeByIdAsync(holderId);
            return emp?.Name ?? "Unknown Employee";
        }
        else
        {
            var dept = await _departmentService.GetDepartmentByIdAsync(holderId);
            return dept?.Name ?? "Unknown Department";
        }
    }

    public async Task<Allocation> AllocateAsync(CreateAllocationRequest request, string currentUserId)
    {
        // 1. App-level check
        var activeAlloc = await _allocationRepository.GetActiveByAssetIdAsync(request.AssetId);
        if (activeAlloc != null)
        {
            var holderName = await GetHolderNameAsync(activeAlloc.HolderId, activeAlloc.HolderType);
            throw new DoubleAllocationException(
                $"Currently held by {holderName}", 
                activeAlloc.HolderId, 
                holderName, 
                activeAlloc.Id
            );
        }

        var allocation = new Allocation
        {
            AssetId = request.AssetId,
            HolderId = request.HolderId,
            HolderType = request.HolderType,
            ExpectedReturnDate = request.ExpectedReturnDate,
            AllocatedBy = currentUserId,
            AllocatedAt = DateTime.UtcNow,
            Status = AllocationStatus.Active
        };

        try
        {
            // 2. DB-level backstop check
            await _allocationRepository.CreateAsync(allocation);
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            // Race condition caught by partial unique index
            var active = await _allocationRepository.GetActiveByAssetIdAsync(request.AssetId);
            if (active != null)
            {
                var holderName = await GetHolderNameAsync(active.HolderId, active.HolderType);
                throw new DoubleAllocationException(
                    $"Currently held by {holderName}", 
                    active.HolderId, 
                    holderName, 
                    active.Id
                );
            }
            throw new InvalidOperationException("Asset is already allocated.");
        }

        // 3. Transition asset status
        await _lifecycleService.TryTransitionAsync(request.AssetId, AssetStatus.Allocated, currentUserId, $"Allocated to holder {request.HolderId}");

        return allocation;
    }

    public async Task<Allocation> ReturnAsync(string allocationId, ReturnAllocationRequest request, string currentUserId)
    {
        var allocation = await _allocationRepository.GetByIdAsync(allocationId);
        if (allocation == null || allocation.Status != AllocationStatus.Active)
            throw new ArgumentException("Active allocation not found.");

        allocation.Status = AllocationStatus.Returned;
        allocation.ActualReturnDate = DateTime.UtcNow;
        allocation.CheckInNotes = request.CheckInNotes;
        allocation.CheckInCondition = request.CheckInCondition;
        allocation.UpdatedAt = DateTime.UtcNow;

        await _allocationRepository.UpdateAsync(allocation.Id, allocation);
        
        await _lifecycleService.TryTransitionAsync(allocation.AssetId, AssetStatus.Available, currentUserId, $"Asset returned. Condition: {request.CheckInCondition}");

        return allocation;
    }
}
