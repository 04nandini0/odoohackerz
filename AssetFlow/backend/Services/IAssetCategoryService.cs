using AssetFlow.DTOs;
using AssetFlow.Models;

namespace AssetFlow.Services;

public interface IAssetCategoryService
{
    Task<List<AssetCategory>> GetAllAsync();
    Task<AssetCategory> CreateAsync(CreateAssetCategoryRequest request, string currentUserId);
    Task<AssetCategory> UpdateAsync(string id, UpdateAssetCategoryRequest request, string currentUserId);
    Task DeleteAsync(string id, string currentUserId);
}
