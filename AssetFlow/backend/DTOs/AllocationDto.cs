using System.ComponentModel.DataAnnotations;
using AssetFlow.Models;

namespace AssetFlow.DTOs;

public class CreateAllocationRequest
{
    [Required]
    public string AssetId { get; set; } = string.Empty;

    [Required]
    public string HolderId { get; set; } = string.Empty;

    [Required]
    public HolderType HolderType { get; set; }

    public DateTime? ExpectedReturnDate { get; set; }
}

public class ReturnAllocationRequest
{
    public string? CheckInNotes { get; set; }
    
    [Required]
    public AssetCondition CheckInCondition { get; set; }
}
