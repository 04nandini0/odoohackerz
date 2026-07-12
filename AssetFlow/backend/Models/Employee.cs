// Domain entity representing a Employee in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssetFlow.Models;

public class Employee
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    
    // TODO: implement properties
}\n