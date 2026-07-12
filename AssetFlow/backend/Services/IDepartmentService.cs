using AssetFlow.DTOs;

namespace AssetFlow.Services;

public interface IDepartmentService
{
    Task<List<DepartmentResponse>> GetAllAsync(string? statusFilter = null);
    Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request, string currentUserId);
    Task<DepartmentResponse> UpdateAsync(string id, UpdateDepartmentRequest request, string currentUserId);
    Task DeleteAsync(string id, string currentUserId);
}
