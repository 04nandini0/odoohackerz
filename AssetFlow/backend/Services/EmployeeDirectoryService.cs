using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public class EmployeeDirectoryService : IEmployeeDirectoryService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IActivityLogService _activityLogService;

    public EmployeeDirectoryService(
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository,
        IActivityLogService activityLogService)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _activityLogService = activityLogService;
    }

    public async Task<List<EmployeeDirectoryResponse>> GetAllEmployeesAsync(string? departmentId = null, string? roleFilter = null)
    {
        var employees = await _employeeRepository.GetAllAsync();
        
        if (!string.IsNullOrEmpty(departmentId))
        {
            employees = employees.Where(e => e.DepartmentId == departmentId).ToList();
        }

        if (!string.IsNullOrEmpty(roleFilter) && Enum.TryParse<EmployeeRole>(roleFilter, true, out var role))
        {
            employees = employees.Where(e => e.Role == role).ToList();
        }

        var departments = await _departmentRepository.GetAllAsync();
        var deptMap = departments.ToDictionary(d => d.Id, d => d.Name);

        return employees.Select(e => new EmployeeDirectoryResponse
        {
            Id = e.Id,
            Name = e.Name,
            Email = e.Email,
            DepartmentId = e.DepartmentId,
            DepartmentName = !string.IsNullOrEmpty(e.DepartmentId) && deptMap.ContainsKey(e.DepartmentId) ? deptMap[e.DepartmentId] : null,
            Role = e.Role.ToString(),
            Status = e.Status
        }).ToList();
    }

    public async Task<EmployeeDirectoryResponse> ToggleStatusAsync(string id, UpdateEmployeeStatusRequest request, string currentUserId)
    {
        var emp = await _employeeRepository.GetByIdAsync(id);
        if (emp == null) throw new ArgumentException("Employee not found.");

        if (emp.Id == currentUserId)
            throw new InvalidOperationException("You cannot toggle your own status.");

        if (emp.Role == EmployeeRole.Admin)
            throw new InvalidOperationException("Admin status cannot be modified via this endpoint.");

        var oldStatus = emp.Status;
        emp.Status = request.Status;

        await _employeeRepository.UpdateAsync(emp.Id, emp);
        await _activityLogService.LogAsync("ToggleEmployeeStatus", $"Changed status of {emp.Name} from {oldStatus} to {emp.Status}", currentUserId, emp.Id);

        return await MapToResponseAsync(emp);
    }

    public async Task<EmployeeDirectoryResponse> ReassignDepartmentAsync(string id, UpdateEmployeeDepartmentRequest request, string currentUserId)
    {
        var emp = await _employeeRepository.GetByIdAsync(id);
        if (emp == null) throw new ArgumentException("Employee not found.");

        if (!string.IsNullOrEmpty(request.DepartmentId))
        {
            var dept = await _departmentRepository.GetByIdAsync(request.DepartmentId);
            if (dept == null || dept.Status == DepartmentStatus.Inactive)
                throw new ArgumentException("Department not found or inactive.");
        }

        var oldDeptId = emp.DepartmentId;
        emp.DepartmentId = request.DepartmentId;

        await _employeeRepository.UpdateAsync(emp.Id, emp);
        await _activityLogService.LogAsync("ReassignDepartment", $"Reassigned {emp.Name} to department {(request.DepartmentId ?? "None")}", currentUserId, emp.Id);

        return await MapToResponseAsync(emp);
    }

    public async Task<EmployeeDirectoryResponse> PromoteEmployeeAsync(string id, PromoteEmployeeRequest request, string currentUserId)
    {
        var emp = await _employeeRepository.GetByIdAsync(id);
        if (emp == null) throw new ArgumentException("Employee not found.");

        if (request.NewRole == "Admin" || request.NewRole == "Admin") // Extra safeguard
        {
            // The prompt strictly says:
            // Explicitly reject attempts to set role to "Admin" via this endpoint (admin promotion, if ever needed, is a separate manual/seeded action, never exposed via API — add a comment explaining this is intentional to prevent privilege escalation chains)
            throw new InvalidOperationException("Intentional safeguard: Admin promotion via the API is forbidden to prevent privilege escalation chains.");
        }

        if (!Enum.TryParse<EmployeeRole>(request.NewRole, true, out var newRole))
        {
            throw new ArgumentException("Invalid role specified.");
        }

        var oldRole = emp.Role;
        emp.Role = newRole;

        await _employeeRepository.UpdateAsync(emp.Id, emp);
        await _activityLogService.LogAsync("PromoteEmployee", $"Promoted {emp.Name} from {oldRole} to {newRole}", currentUserId, emp.Id, $"{{ \"oldRole\": \"{oldRole}\", \"newRole\": \"{newRole}\" }}");

        return await MapToResponseAsync(emp);
    }

    private async Task<EmployeeDirectoryResponse> MapToResponseAsync(Employee e)
    {
        string? deptName = null;
        if (!string.IsNullOrEmpty(e.DepartmentId))
        {
            var dept = await _departmentRepository.GetByIdAsync(e.DepartmentId);
            deptName = dept?.Name;
        }

        return new EmployeeDirectoryResponse
        {
            Id = e.Id,
            Name = e.Name,
            Email = e.Email,
            DepartmentId = e.DepartmentId,
            DepartmentName = deptName,
            Role = e.Role.ToString(),
            Status = e.Status
        };
    }
}
