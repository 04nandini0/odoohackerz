// Domain entity representing a Department in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum DepartmentStatus
{
    Active,
    Inactive
}

public class Department
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("parentDepartmentId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ParentDepartmentId { get; set; }

    [BsonElement("departmentHeadId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DepartmentHeadId { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public DepartmentStatus Status { get; set; } = DepartmentStatus.Active;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}