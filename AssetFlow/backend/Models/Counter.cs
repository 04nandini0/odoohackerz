using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class Counter
{
    [BsonId]
    public string Id { get; set; } = string.Empty;

    [BsonElement("seq")]
    public long Seq { get; set; }
}
