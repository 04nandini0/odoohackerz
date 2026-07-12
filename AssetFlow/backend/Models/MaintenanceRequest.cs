using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum MaintenancePriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum MaintenanceStatus
{
    Pending,
    Approved,
    Rejected,
    TechnicianAssigned,
    InProgress,
    Resolved
}

public class MaintenanceRequest
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("assetId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string AssetId { get; set; } = string.Empty;

    [BsonElement("raisedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RaisedBy { get; set; } = string.Empty;

    [BsonElement("issue")]
    public string Issue { get; set; } = string.Empty;

    [BsonElement("priority")]
    [BsonRepresentation(BsonType.String)]
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;

    [BsonElement("photoUrls")]
    public List<string> PhotoUrls { get; set; } = new();

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Pending;

    [BsonElement("approvedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ApprovedBy { get; set; }

    [BsonElement("rejectionReason")]
    public string? RejectionReason { get; set; }

    [BsonElement("technicianId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TechnicianId { get; set; }

    [BsonElement("raisedAt")]
    public DateTime RaisedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("approvedAt")]
    public DateTime? ApprovedAt { get; set; }

    [BsonElement("resolvedAt")]
    public DateTime? ResolvedAt { get; set; }

    [BsonElement("resolutionNotes")]
    public string? ResolutionNotes { get; set; }
}