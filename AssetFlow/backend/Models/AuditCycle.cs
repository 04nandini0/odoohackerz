// Domain entity representing a AuditCycle in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class AuditCycle
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    
    // TODO: implement properties
}\n