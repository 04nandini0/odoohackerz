using System.ComponentModel.DataAnnotations;
using AssetFlow.Models;

namespace AssetFlow.DTOs;

public class CreateMaintenanceRequestDto
{
    [Required]
    public string AssetId { get; set; } = string.Empty;

    [Required]
    public string Issue { get; set; } = string.Empty;

    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;

    public List<string> PhotoUrls { get; set; } = new();
}

public class RejectMaintenanceRequestDto
{
    [Required]
    public string RejectionReason { get; set; } = string.Empty;
}

public class AssignTechnicianRequestDto
{
    [Required]
    public string TechnicianId { get; set; } = string.Empty;
}

public class ResolveMaintenanceRequestDto
{
    [Required]
    public string ResolutionNotes { get; set; } = string.Empty;
}