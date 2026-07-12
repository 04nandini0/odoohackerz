using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IActivityLogService _activityLogService;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        IEmployeeRepository employeeRepository,
        IAssetRepository assetRepository,
        IActivityLogService activityLogService)
    {
        _departmentRepository = departmentRepository;
        _employeeRepository = employeeRepository;
        _assetRepository = assetRepository;
        _activityLogService = activityLogService;
    }

    public async Task<Department?> GetDepartmentByIdAsync(string id)
    {
        return await _departmentRepository.GetByIdAsync(id);
    }

    public async Task<List<DepartmentResponse>> GetAllAsync(string? statusFilter = null)
    {
        var departments = await _departmentRepository.GetAllAsync();
        
        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<DepartmentStatus>(statusFilter, true, out var status))
        {
            departments = departments.Where(d => d.Status == status).ToList();
        }

        var employees = await _employeeRepository.GetAllAsync();
        var employeeMap = employees.ToDictionary(e => e.Id, e => e.Name);
        var deptMap = departments.ToDictionary(d => d.Id, d => d.Name);

        return departments.Select(d => new DepartmentResponse
        {
            Id = d.Id,
            Name = d.Name,
            ParentDepartmentId = d.ParentDepartmentId,
            ParentDepartmentName = !string.IsNullOrEmpty(d.ParentDepartmentId) && deptMap.ContainsKey(d.ParentDepartmentId) ? deptMap[d.ParentDepartmentId] : null,
            DepartmentHeadId = d.DepartmentHeadId,
            DepartmentHeadName = !string.IsNullOrEmpty(d.DepartmentHeadId) && employeeMap.ContainsKey(d.DepartmentHeadId) ? employeeMap[d.DepartmentHeadId] : null,
            Status = d.Status
        }).ToList();
    }

    public async Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request, string currentUserId)
    {
        var existing = await _departmentRepository.FindByNameAsync(request.Name);
        if (existing != null)
        {
            throw new ArgumentException("A department with this name already exists.");
        }

        if (!string.IsNullOrEmpty(request.ParentDepartmentId))
        {
            var parent = await _departmentRepository.GetByIdAsync(request.ParentDepartmentId);
            if (parent == null || parent.Status == DepartmentStatus.Inactive)
                throw new ArgumentException("Parent department not found or is inactive.");
        }

        if (!string.IsNullOrEmpty(request.DepartmentHeadId))
        {
            var emp = await _employeeRepository.GetByIdAsync(request.DepartmentHeadId);
            if (emp == null || emp.Status == EmployeeStatus.Inactive)
                throw new ArgumentException("Department head not found or is inactive.");

            // Promote to DepartmentHead if they are a standard Employee
            if (emp.Role == EmployeeRole.Employee)
            {
                emp.Role = EmployeeRole.DepartmentHead;
                await _employeeRepository.UpdateAsync(emp.Id, emp);
                await _activityLogService.LogAsync(currentUserId, "PromoteEmployee", "Department", emp.Id);
            }
        }

        var department = new Department
        {
            Name = request.Name,
            ParentDepartmentId = request.ParentDepartmentId,
            DepartmentHeadId = request.DepartmentHeadId,
            Status = DepartmentStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _departmentRepository.CreateAsync(department);
        
        await _activityLogService.LogAsync(currentUserId, "CreateDepartment", "Department", department.Id);

        return await MapToResponseAsync(department);
    }

    public async Task<DepartmentResponse> UpdateAsync(string id, UpdateDepartmentRequest request, string currentUserId)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null) throw new ArgumentException("Department not found.");

        if (department.Name != request.Name)
        {
            var existing = await _departmentRepository.FindByNameAsync(request.Name);
            if (existing != null && existing.Id != id)
            {
                throw new ArgumentException("A department with this name already exists.");
            }
        }

        // Prevent circular hierarchy
        if (!string.IsNullOrEmpty(request.ParentDepartmentId))
        {
            if (request.ParentDepartmentId == id) throw new ArgumentException("A department cannot be its own parent.");
            
            var currentParentId = request.ParentDepartmentId;
            while (!string.IsNullOrEmpty(currentParentId))
            {
                if (currentParentId == id) throw new ArgumentException("Circular parent hierarchy detected.");
                var parentDept = await _departmentRepository.GetByIdAsync(currentParentId);
                currentParentId = parentDept?.ParentDepartmentId;
            }
        }

        if (!string.IsNullOrEmpty(request.DepartmentHeadId) && request.DepartmentHeadId != department.DepartmentHeadId)
        {
            var emp = await _employeeRepository.GetByIdAsync(request.DepartmentHeadId);
            if (emp == null || emp.Status == EmployeeStatus.Inactive)
                throw new ArgumentException("Department head not found or is inactive.");

            if (emp.Role == EmployeeRole.Employee)
            {
                emp.Role = EmployeeRole.DepartmentHead;
                await _employeeRepository.UpdateAsync(emp.Id, emp);
                await _activityLogService.LogAsync(currentUserId, "PromoteEmployee", "Department", emp.Id);
            }
        }

        department.Name = request.Name;
        department.ParentDepartmentId = request.ParentDepartmentId;
        department.DepartmentHeadId = request.DepartmentHeadId;
        department.Status = request.Status;
        department.UpdatedAt = DateTime.UtcNow;

        await _departmentRepository.UpdateAsync(id, department);
        await _activityLogService.LogAsync(currentUserId, "UpdateDepartment", "Department", department.Id);

        return await MapToResponseAsync(department);
    }

    public async Task DeleteAsync(string id, string currentUserId)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null) return;

        // Validation for soft delete
        if (await _departmentRepository.HasChildrenAsync(id))
            throw new InvalidOperationException("Cannot deactivate department because it has active sub-departments.");
            
        var employees = await _employeeRepository.GetAllAsync();
        if (employees.Any(e => e.DepartmentId == id && e.Status == EmployeeStatus.Active))
            throw new InvalidOperationException("Cannot deactivate department because it has active employees.");
            
        if (await _assetRepository.HasAssetsByDepartmentAsync(id))
            throw new InvalidOperationException("Cannot deactivate department because it has active assets.");

        department.Status = DepartmentStatus.Inactive;
        department.UpdatedAt = DateTime.UtcNow;
        
        await _departmentRepository.UpdateAsync(id, department);
        await _activityLogService.LogAsync(currentUserId, "DeactivateDepartment", "Department", department.Id);
    }

    private async Task<DepartmentResponse> MapToResponseAsync(Department d)
    {
        string? parentName = null;
        if (!string.IsNullOrEmpty(d.ParentDepartmentId))
        {
            var p = await _departmentRepository.GetByIdAsync(d.ParentDepartmentId);
            parentName = p?.Name;
        }

        string? headName = null;
        if (!string.IsNullOrEmpty(d.DepartmentHeadId))
        {
            var h = await _employeeRepository.GetByIdAsync(d.DepartmentHeadId);
            headName = h?.Name;
        }

        return new DepartmentResponse
        {
            Id = d.Id,
            Name = d.Name,
            ParentDepartmentId = d.ParentDepartmentId,
            ParentDepartmentName = parentName,
            DepartmentHeadId = d.DepartmentHeadId,
            DepartmentHeadName = headName,
            Status = d.Status
        };
    }
}
