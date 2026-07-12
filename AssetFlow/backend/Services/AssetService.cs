using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using System.Text.RegularExpressions;

namespace AssetFlow.Services;

public class AssetService : IAssetService
{
    private readonly IAssetRepository _assetRepository;
    private readonly IAssetCategoryRepository _categoryRepository;
    private readonly ICounterRepository _counterRepository;
    private readonly IActivityLogService _activityLogService;

    public AssetService(
        IAssetRepository assetRepository,
        IAssetCategoryRepository categoryRepository,
        ICounterRepository counterRepository,
        IActivityLogService activityLogService)
    {
        _assetRepository = assetRepository;
        _categoryRepository = categoryRepository;
        _counterRepository = counterRepository;
        _activityLogService = activityLogService;
    }

    public async Task<Asset> CreateAsync(CreateAssetRequest request, string currentUserId)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null)
            throw new ArgumentException("Invalid category specified.");

        // Validate custom fields
        foreach (var fieldDef in category.CustomFields)
        {
            if (fieldDef.Required && (!request.CustomFieldValues.ContainsKey(fieldDef.FieldName) || string.IsNullOrWhiteSpace(request.CustomFieldValues[fieldDef.FieldName])))
            {
                throw new ArgumentException($"Missing required custom field: {fieldDef.FieldName}");
            }

            if (request.CustomFieldValues.TryGetValue(fieldDef.FieldName, out var val) && !string.IsNullOrWhiteSpace(val))
            {
                if (fieldDef.FieldType == "number" && !decimal.TryParse(val, out _))
                {
                    throw new ArgumentException($"Custom field {fieldDef.FieldName} must be a number.");
                }
                if (fieldDef.FieldType == "date" && !DateTime.TryParse(val, out _))
                {
                    throw new ArgumentException($"Custom field {fieldDef.FieldName} must be a valid date.");
                }
            }
        }

        // Strip out any custom fields that aren't defined in the category
        var validCustomFields = new Dictionary<string, string>();
        foreach (var fieldDef in category.CustomFields)
        {
            if (request.CustomFieldValues.TryGetValue(fieldDef.FieldName, out var val))
            {
                validCustomFields[fieldDef.FieldName] = val;
            }
        }

        // Generate Tag atomically
        var seq = await _counterRepository.GetNextSequenceValueAsync("assetTag");
        var tag = $"AF-{seq:D4}";

        var asset = new Asset
        {
            Tag = tag,
            Name = request.Name,
            CategoryId = request.CategoryId,
            CustomFieldValues = validCustomFields,
            SerialNumber = request.SerialNumber,
            AcquisitionDate = request.AcquisitionDate,
            AcquisitionCost = request.AcquisitionCost,
            Condition = request.Condition,
            Location = request.Location,
            IsBookable = request.IsBookable,
            Status = AssetStatus.Available, // Default status
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId
        };

        await _assetRepository.CreateAsync(asset);
        await _activityLogService.LogAsync("RegisterAsset", $"Registered new asset {asset.Tag} ({asset.Name})", currentUserId, asset.Id);

        return asset;
    }

    public async Task<Asset> UpdateAsync(string id, UpdateAssetRequest request, string currentUserId)
    {
        var asset = await _assetRepository.GetByIdAsync(id);
        if (asset == null)
            throw new ArgumentException("Asset not found.");

        var category = await _categoryRepository.GetByIdAsync(asset.CategoryId);
        if (category == null)
            throw new ArgumentException("Asset category not found (invalid state).");

        // Validate custom fields
        foreach (var fieldDef in category.CustomFields)
        {
            if (fieldDef.Required && (!request.CustomFieldValues.ContainsKey(fieldDef.FieldName) || string.IsNullOrWhiteSpace(request.CustomFieldValues[fieldDef.FieldName])))
            {
                throw new ArgumentException($"Missing required custom field: {fieldDef.FieldName}");
            }

            if (request.CustomFieldValues.TryGetValue(fieldDef.FieldName, out var val) && !string.IsNullOrWhiteSpace(val))
            {
                if (fieldDef.FieldType == "number" && !decimal.TryParse(val, out _))
                {
                    throw new ArgumentException($"Custom field {fieldDef.FieldName} must be a number.");
                }
                if (fieldDef.FieldType == "date" && !DateTime.TryParse(val, out _))
                {
                    throw new ArgumentException($"Custom field {fieldDef.FieldName} must be a valid date.");
                }
            }
        }

        var validCustomFields = new Dictionary<string, string>();
        foreach (var fieldDef in category.CustomFields)
        {
            if (request.CustomFieldValues.TryGetValue(fieldDef.FieldName, out var val))
            {
                validCustomFields[fieldDef.FieldName] = val;
            }
        }

        asset.Name = request.Name;
        asset.Condition = request.Condition;
        asset.Location = request.Location;
        asset.CustomFieldValues = validCustomFields;
        asset.UpdatedAt = DateTime.UtcNow;

        await _assetRepository.UpdateAsync(id, asset);
        await _activityLogService.LogAsync("UpdateAsset", $"Updated asset {asset.Tag} details", currentUserId, asset.Id);

        return asset;
    }

    public async Task<List<Asset>> SearchAsync(string? tag, string? serialNumber, string? categoryId, string? status, string? departmentId, string? location, string? search)
    {
        return await _assetRepository.SearchAssetsAsync(tag, serialNumber, categoryId, status, departmentId, location, search);
    }

    public async Task<Asset?> GetByIdAsync(string id)
    {
        return await _assetRepository.GetByIdAsync(id);
    }
}
