using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum HolderType
{
    Employee,
    Department
}

public enum AllocationStatus
{
    Active,
    Returned
}

public class Allocation
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("assetId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string AssetId { get; set; } = string.Empty;

    [BsonElement("holderId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string HolderId { get; set; } = string.Empty;

    [BsonElement("holderType")]
    [BsonRepresentation(BsonType.String)]
    public HolderType HolderType { get; set; }

    [BsonElement("allocatedAt")]
    public DateTime AllocatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("allocatedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string AllocatedBy { get; set; } = string.Empty;

    [BsonElement("expectedReturnDate")]
    public DateTime? ExpectedReturnDate { get; set; }

    [BsonElement("actualReturnDate")]
    public DateTime? ActualReturnDate { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public AllocationStatus Status { get; set; } = AllocationStatus.Active;

    [BsonElement("checkInNotes")]
    public string? CheckInNotes { get; set; }

    [BsonElement("checkInCondition")]
    [BsonRepresentation(BsonType.String)]
    public AssetCondition? CheckInCondition { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}