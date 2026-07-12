using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public class AssetCategoryService : IAssetCategoryService
{
    private readonly IAssetCategoryRepository _categoryRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IActivityLogService _activityLogService;

    public AssetCategoryService(
        IAssetCategoryRepository categoryRepository,
        IAssetRepository assetRepository,
        IActivityLogService activityLogService)
    {
        _categoryRepository = categoryRepository;
        _assetRepository = assetRepository;
        _activityLogService = activityLogService;
    }

    public async Task<List<AssetCategory>> GetAllAsync()
    {
        var all = await _categoryRepository.GetAllAsync();
        return all.Where(c => c.Status == DepartmentStatus.Active).ToList();
    }

    public async Task<AssetCategory> CreateAsync(CreateAssetCategoryRequest request, string currentUserId)
    {
        var existing = await _categoryRepository.FindByNameAsync(request.Name);
        if (existing != null)
        {
            throw new ArgumentException("An asset category with this name already exists.");
        }

        var category = new AssetCategory
        {
            Name = request.Name,
            CustomFields = request.CustomFields.Select(c => new CustomFieldDefinition
            {
                FieldName = c.FieldName,
                FieldType = c.FieldType,
                Required = c.Required
            }).ToList(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _categoryRepository.CreateAsync(category);
        await _activityLogService.LogAsync("CreateAssetCategory", $"Created asset category {category.Name}", currentUserId, category.Id);

        return category;
    }

    public async Task<AssetCategory> UpdateAsync(string id, UpdateAssetCategoryRequest request, string currentUserId)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) throw new ArgumentException("Asset category not found.");

        if (category.Name != request.Name)
        {
            var existing = await _categoryRepository.FindByNameAsync(request.Name);
            if (existing != null && existing.Id != id)
            {
                throw new ArgumentException("An asset category with this name already exists.");
            }
        }

        category.Name = request.Name;
        category.CustomFields = request.CustomFields.Select(c => new CustomFieldDefinition
        {
            FieldName = c.FieldName,
            FieldType = c.FieldType,
            Required = c.Required
        }).ToList();
        category.UpdatedAt = DateTime.UtcNow;

        await _categoryRepository.UpdateAsync(id, category);
        await _activityLogService.LogAsync("UpdateAssetCategory", $"Updated asset category {category.Name}", currentUserId, category.Id);

        return category;
    }

    public async Task DeleteAsync(string id, string currentUserId)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return;

        if (await _assetRepository.HasAssetsByCategoryAsync(id))
            throw new InvalidOperationException("Cannot delete asset category because it is currently assigned to active assets.");

        // Soft delete
        category.Status = DepartmentStatus.Inactive;
        category.UpdatedAt = DateTime.UtcNow;
        
        await _categoryRepository.UpdateAsync(id, category);
        await _activityLogService.LogAsync("DeactivateAssetCategory", $"Deactivated asset category {category.Name}", currentUserId, category.Id);
    }
}
