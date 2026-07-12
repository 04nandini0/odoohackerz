using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum TransferStatus
{
    Requested,
    Approved,
    Rejected
}

public class Transfer
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("allocationId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string AllocationId { get; set; } = string.Empty;

    [BsonElement("assetId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string AssetId { get; set; } = string.Empty;

    [BsonElement("fromHolderId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string FromHolderId { get; set; } = string.Empty;

    [BsonElement("toHolderId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ToHolderId { get; set; } = string.Empty;

    [BsonElement("toHolderType")]
    [BsonRepresentation(BsonType.String)]
    public HolderType ToHolderType { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public TransferStatus Status { get; set; } = TransferStatus.Requested;

    [BsonElement("requestedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RequestedBy { get; set; } = string.Empty;

    [BsonElement("approvedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ApprovedBy { get; set; }

    [BsonElement("requestedAt")]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("resolvedAt")]
    public DateTime? ResolvedAt { get; set; }

    [BsonElement("rejectionReason")]
    public string? RejectionReason { get; set; }
}