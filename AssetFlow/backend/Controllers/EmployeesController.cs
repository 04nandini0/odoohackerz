using AssetFlow.DTOs;
using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeDirectoryService _employeeService;

    public EmployeesController(IEmployeeDirectoryService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    [RequireRole(EmployeeRole.Admin, EmployeeRole.AssetManager, EmployeeRole.DepartmentHead)]
    public async Task<IActionResult> GetAll([FromQuery] string? departmentId, [FromQuery] string? role)
    {
        var result = await _employeeService.GetAllEmployeesAsync(departmentId, role);
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    [RequireRole(EmployeeRole.Admin)]
    public async Task<IActionResult> ToggleStatus(string id, [FromBody] UpdateEmployeeStatusRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _employeeService.ToggleStatusAsync(id, request, currentUserId);
        return Ok(result);
    }

    [HttpPut("{id}/department")]
    [RequireRole(EmployeeRole.Admin)]
    public async Task<IActionResult> ReassignDepartment(string id, [FromBody] UpdateEmployeeDepartmentRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _employeeService.ReassignDepartmentAsync(id, request, currentUserId);
        return Ok(result);
    }

    [HttpPost("{id}/promote")]
    [RequireRole(EmployeeRole.Admin)]
    public async Task<IActionResult> Promote(string id, [FromBody] PromoteEmployeeRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _employeeService.PromoteEmployeeAsync(id, request, currentUserId);
        return Ok(result);
    }
}
/*
Testing checklist:
- [ ] Promote endpoint rejects "Admin" as a target role
- [ ] Promote endpoint correctly updates the employee's role and logs it
*/
