using AssetFlow.DTOs;
using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/asset-categories")]
[Authorize]
[RequireRole(EmployeeRole.Admin)]
public class AssetCategoriesController : ControllerBase
{
    private readonly IAssetCategoryService _categoryService;

    public AssetCategoriesController(IAssetCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _categoryService.GetAllAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssetCategoryRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _categoryService.CreateAsync(request, currentUserId);
        return Created("", result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAssetCategoryRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _categoryService.UpdateAsync(id, request, currentUserId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
            await _categoryService.DeleteAsync(id, currentUserId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
/*
Testing checklist:
- [ ] Asset category deletion blocked (409) if assets reference it
*/
