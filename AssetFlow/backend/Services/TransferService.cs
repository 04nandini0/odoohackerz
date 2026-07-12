using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using MongoDB.Driver;

namespace AssetFlow.Services;

public interface ITransferService
{
    Task<Transfer> RequestTransferAsync(CreateTransferRequest request, string currentUserId);
    Task<Transfer> ApproveTransferAsync(string transferId, string currentUserId);
    Task<Transfer> RejectTransferAsync(string transferId, RejectTransferRequest request, string currentUserId);
}

public class TransferService : ITransferService
{
    private readonly ITransferRepository _transferRepository;
    private readonly IAllocationRepository _allocationRepository;
    private readonly IMongoClient _mongoClient;

    public TransferService(ITransferRepository transferRepository, IAllocationRepository allocationRepository, IMongoClient mongoClient)
    {
        _transferRepository = transferRepository;
        _allocationRepository = allocationRepository;
        _mongoClient = mongoClient;
    }

    public async Task<Transfer> RequestTransferAsync(CreateTransferRequest request, string currentUserId)
    {
        var allocation = await _allocationRepository.GetByIdAsync(request.AllocationId);
        if (allocation == null || allocation.Status != AllocationStatus.Active)
            throw new ArgumentException("Allocation is not active or does not exist.");

        var transfer = new Transfer
        {
            AllocationId = request.AllocationId,
            AssetId = allocation.AssetId,
            FromHolderId = allocation.HolderId,
            ToHolderId = request.ToHolderId,
            ToHolderType = request.ToHolderType,
            RequestedBy = currentUserId,
            Status = TransferStatus.Requested
        };

        await _transferRepository.CreateAsync(transfer);
        return transfer;
    }

    public async Task<Transfer> ApproveTransferAsync(string transferId, string currentUserId)
    {
        var transfer = await _transferRepository.GetByIdAsync(transferId);
        if (transfer == null || transfer.Status != TransferStatus.Requested)
            throw new ArgumentException("Valid pending transfer request not found.");

        using var session = await _mongoClient.StartSessionAsync();
        
        try
        {
            session.StartTransaction();

            var oldAlloc = await _allocationRepository.GetByIdAsync(transfer.AllocationId);
            if (oldAlloc == null || oldAlloc.Status != AllocationStatus.Active)
                throw new InvalidOperationException("The original allocation is no longer active.");

            // Mark old returned
            oldAlloc.Status = AllocationStatus.Returned;
            oldAlloc.ActualReturnDate = DateTime.UtcNow;
            oldAlloc.CheckInNotes = "Transferred to new holder";
            oldAlloc.UpdatedAt = DateTime.UtcNow;
            await _allocationRepository.UpdateAsync(oldAlloc.Id, oldAlloc);

            // Create new allocation
            var newAlloc = new Allocation
            {
                AssetId = transfer.AssetId,
                HolderId = transfer.ToHolderId,
                HolderType = transfer.ToHolderType,
                AllocatedBy = currentUserId,
                AllocatedAt = DateTime.UtcNow,
                Status = AllocationStatus.Active
            };
            await _allocationRepository.CreateAsync(newAlloc);

            // Update transfer
            transfer.Status = TransferStatus.Approved;
            transfer.ApprovedBy = currentUserId;
            transfer.ResolvedAt = DateTime.UtcNow;
            await _transferRepository.UpdateAsync(transfer.Id, transfer);

            await session.CommitTransactionAsync();
            return transfer;
        }
        catch (Exception)
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }

    public async Task<Transfer> RejectTransferAsync(string transferId, RejectTransferRequest request, string currentUserId)
    {
        var transfer = await _transferRepository.GetByIdAsync(transferId);
        if (transfer == null || transfer.Status != TransferStatus.Requested)
            throw new ArgumentException("Valid pending transfer request not found.");

        transfer.Status = TransferStatus.Rejected;
        transfer.ResolvedAt = DateTime.UtcNow;
        transfer.RejectionReason = request.RejectionReason;

        await _transferRepository.UpdateAsync(transfer.Id, transfer);
        return transfer;
    }
}
