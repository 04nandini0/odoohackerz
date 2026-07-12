// Domain entity representing a AssetCategory in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class CustomFieldDefinition
{
    [BsonElement("fieldName")]
    public string FieldName { get; set; } = string.Empty;

    [BsonElement("fieldType")]
    public string FieldType { get; set; } = "text"; // text, number, date

    [BsonElement("required")]
    public bool Required { get; set; } = false;
}

public class AssetCategory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("customFields")]
    public List<CustomFieldDefinition> CustomFields { get; set; } = new();

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public DepartmentStatus Status { get; set; } = DepartmentStatus.Active;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}