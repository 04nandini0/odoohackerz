using System.ComponentModel.DataAnnotations;
using AssetFlow.Models;

namespace AssetFlow.DTOs;

public class CreateDepartmentRequest
{
    [Required(ErrorMessage = "Department Name is required.")]
    public string Name { get; set; } = string.Empty;

    public string? ParentDepartmentId { get; set; }
    public string? DepartmentHeadId { get; set; }
}

public class UpdateDepartmentRequest
{
    [Required(ErrorMessage = "Department Name is required.")]
    public string Name { get; set; } = string.Empty;

    public string? ParentDepartmentId { get; set; }
    public string? DepartmentHeadId { get; set; }
    public DepartmentStatus Status { get; set; }
}

public class DepartmentResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public string? DepartmentHeadId { get; set; }
    public string? DepartmentHeadName { get; set; }
    public DepartmentStatus Status { get; set; }
}

public class CustomFieldDefinitionDto
{
    [Required(ErrorMessage = "Field Name is required.")]
    public string FieldName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Field Type is required.")]
    public string FieldType { get; set; } = "text";

    public bool Required { get; set; }
}

public class CreateAssetCategoryRequest
{
    [Required(ErrorMessage = "Category Name is required.")]
    public string Name { get; set; } = string.Empty;

    public List<CustomFieldDefinitionDto> CustomFields { get; set; } = new();
}

public class UpdateAssetCategoryRequest
{
    [Required(ErrorMessage = "Category Name is required.")]
    public string Name { get; set; } = string.Empty;

    public List<CustomFieldDefinitionDto> CustomFields { get; set; } = new();
}

public class PromoteEmployeeRequest
{
    [Required(ErrorMessage = "New Role is required.")]
    [RegularExpression("^(DepartmentHead|AssetManager)$", ErrorMessage = "Role must be DepartmentHead or AssetManager.")]
    public string NewRole { get; set; } = string.Empty;
}

public class UpdateEmployeeDepartmentRequest
{
    public string? DepartmentId { get; set; }
}

public class UpdateEmployeeStatusRequest
{
    [Required(ErrorMessage = "Status is required.")]
    public EmployeeStatus Status { get; set; }
}

public class EmployeeDirectoryResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string Role { get; set; } = string.Empty;
    public EmployeeStatus Status { get; set; }
}