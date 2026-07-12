using System.ComponentModel.DataAnnotations;
using AssetFlow.Models;

namespace AssetFlow.DTOs;

public class CreateTransferRequest
{
    [Required]
    public string AllocationId { get; set; } = string.Empty;

    [Required]
    public string ToHolderId { get; set; } = string.Empty;

    [Required]
    public HolderType ToHolderType { get; set; }
}

public class RejectTransferRequest
{
    [Required]
    public string RejectionReason { get; set; } = string.Empty;
}
