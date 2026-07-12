using System.ComponentModel.DataAnnotations;
using AssetFlow.Models;

namespace AssetFlow.DTOs;

public class CreateAssetRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string CategoryId { get; set; } = string.Empty;

    public Dictionary<string, string> CustomFieldValues { get; set; } = new();

    public string? SerialNumber { get; set; }

    public DateTime AcquisitionDate { get; set; }

    public decimal AcquisitionCost { get; set; }

    public AssetCondition Condition { get; set; }

    public string Location { get; set; } = string.Empty;

    public bool IsBookable { get; set; }
}

public class UpdateAssetRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public Dictionary<string, string> CustomFieldValues { get; set; } = new();

    public AssetCondition Condition { get; set; }

    public string Location { get; set; } = string.Empty;
}
