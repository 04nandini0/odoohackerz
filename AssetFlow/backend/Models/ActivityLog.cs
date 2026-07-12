// Domain entity representing a ActivityLog in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class ActivityLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("action")]
    public string Action { get; set; } = string.Empty; // e.g., "PromoteEmployee", "CreateDepartment"

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("performedByEmployeeId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PerformedByEmployeeId { get; set; }

    [BsonElement("targetEntityId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TargetEntityId { get; set; }

    [BsonElement("details")]
    public string? Details { get; set; } // JSON or simple string with old/new roles

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}