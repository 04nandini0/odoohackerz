using AssetFlow.Middleware;
using AssetFlow.Models;
using AssetFlow.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/activity-logs")]
[Authorize]
public class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogRepository _activityLogRepository;

    public ActivityLogsController(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    [HttpGet]
    [RequireRole(EmployeeRole.Admin)]
    public async Task<IActionResult> GetAll([FromQuery] string? userId, [FromQuery] string? entityType)
    {
        var all = await _activityLogRepository.GetAllAsync();
        var query = all.AsQueryable();

        if (!string.IsNullOrEmpty(userId)) query = query.Where(a => a.UserId == userId);
        if (!string.IsNullOrEmpty(entityType)) query = query.Where(a => a.EntityType == entityType);

        return Ok(query.OrderByDescending(a => a.Timestamp).ToList());
    }
}
