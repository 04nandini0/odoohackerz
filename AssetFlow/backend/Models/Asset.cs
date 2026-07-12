using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum AssetStatus
{
    Available,
    Allocated,
    Reserved,
    UnderMaintenance,
    Lost,
    Retired,
    Disposed
}

public enum AssetCondition
{
    New,
    Good,
    Fair,
    Poor,
    Damaged
}

public class Asset
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("tag")]
    public string Tag { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("categoryId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CategoryId { get; set; } = string.Empty;

    [BsonElement("customFieldValues")]
    public Dictionary<string, string> CustomFieldValues { get; set; } = new();

    [BsonElement("serialNumber")]
    public string? SerialNumber { get; set; }

    [BsonElement("acquisitionDate")]
    public DateTime AcquisitionDate { get; set; }

    [BsonElement("acquisitionCost")]
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal AcquisitionCost { get; set; }

    [BsonElement("condition")]
    [BsonRepresentation(BsonType.String)]
    public AssetCondition Condition { get; set; } = AssetCondition.New;

    [BsonElement("location")]
    public string Location { get; set; } = string.Empty;

    [BsonElement("photoUrls")]
    public List<string> PhotoUrls { get; set; } = new();

    [BsonElement("documentUrls")]
    public List<string> DocumentUrls { get; set; } = new();

    [BsonElement("isBookable")]
    public bool IsBookable { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public AssetStatus Status { get; set; } = AssetStatus.Available;

    [BsonElement("departmentId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DepartmentId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }
}