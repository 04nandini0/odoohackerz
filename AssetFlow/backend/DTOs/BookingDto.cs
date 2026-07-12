using System.ComponentModel.DataAnnotations;

namespace AssetFlow.DTOs;

public class CreateBookingRequest
{
    [Required]
    public string ResourceAssetId { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public string? Purpose { get; set; }
}

public class RescheduleBookingRequest
{
    [Required]
    public DateTime NewStartTime { get; set; }

    [Required]
    public DateTime NewEndTime { get; set; }
}
