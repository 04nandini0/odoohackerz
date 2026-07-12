// Domain entity representing a Asset in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class Asset
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    
    // TODO: implement properties
}\n