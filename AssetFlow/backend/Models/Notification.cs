using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public enum NotificationType
{
    AssetAssigned,
    MaintenanceApproved,
    MaintenanceRejected,
    BookingConfirmed,
    BookingCancelled,
    BookingReminder,
    TransferApproved,
    OverdueReturnAlert,
    AuditDiscrepancyFlagged
}

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public NotificationType Type { get; set; }

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    [BsonElement("entityType")]
    public string? EntityType { get; set; }

    [BsonElement("entityId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? EntityId { get; set; }

    [BsonElement("read")]
    public bool Read { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}