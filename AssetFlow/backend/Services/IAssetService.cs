using AssetFlow.DTOs;
using AssetFlow.Models;

namespace AssetFlow.Services;

public interface IAssetService
{
    Task<Asset> CreateAsync(CreateAssetRequest request, string currentUserId);
    Task<Asset> UpdateAsync(string id, UpdateAssetRequest request, string currentUserId);
    Task<List<Asset>> SearchAsync(string? tag, string? serialNumber, string? categoryId, string? status, string? departmentId, string? location, string? search);
    Task<Asset?> GetByIdAsync(string id);
}
