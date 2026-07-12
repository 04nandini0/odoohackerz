using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum BookingStatus
{
    Upcoming,
    Ongoing,
    Completed,
    Cancelled
}

public class Booking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("resourceAssetId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ResourceAssetId { get; set; } = string.Empty;

    [BsonElement("bookedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string BookedBy { get; set; } = string.Empty;

    [BsonElement("startTime")]
    public DateTime StartTime { get; set; }

    [BsonElement("endTime")]
    public DateTime EndTime { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public BookingStatus Status { get; set; } = BookingStatus.Upcoming;

    [BsonElement("purpose")]
    public string? Purpose { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}