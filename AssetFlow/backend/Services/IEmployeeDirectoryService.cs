using AssetFlow.DTOs;

namespace AssetFlow.Services;

public interface IEmployeeDirectoryService
{
    Task<List<EmployeeDirectoryResponse>> GetAllEmployeesAsync(string? departmentId = null, string? roleFilter = null);
    Task<EmployeeDirectoryResponse> ToggleStatusAsync(string id, UpdateEmployeeStatusRequest request, string currentUserId);
    Task<EmployeeDirectoryResponse> ReassignDepartmentAsync(string id, UpdateEmployeeDepartmentRequest request, string currentUserId);
    Task<EmployeeDirectoryResponse> PromoteEmployeeAsync(string id, PromoteEmployeeRequest request, string currentUserId);
}
