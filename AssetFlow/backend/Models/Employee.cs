// Domain entity representing a Employee in the MongoDB database.
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace AssetFlow.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EmployeeRole
{
    Employee,
    DepartmentHead,
    AssetManager,
    Admin
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EmployeeStatus
{
    Active,
    Inactive
}

public class RefreshToken
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;
}

public class Employee
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("departmentId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DepartmentId { get; set; }

    [BsonElement("role")]
    [BsonRepresentation(BsonType.String)]
    public EmployeeRole Role { get; set; } = EmployeeRole.Employee;

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("refreshTokens")]
    public List<RefreshToken> RefreshTokens { get; set; } = new();
    
    [BsonElement("resetPasswordToken")]
    public string? ResetPasswordToken { get; set; }
    
    [BsonElement("resetPasswordTokenExpiry")]
    public DateTime? ResetPasswordTokenExpiry { get; set; }
}