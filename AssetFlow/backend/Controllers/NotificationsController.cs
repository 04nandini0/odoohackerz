using AssetFlow.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationsController(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var notifications = await _notificationRepository.GetByUserIdAsync(currentUserId, unreadOnly);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null) return NotFound();

        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        if (notification.UserId != currentUserId) return Forbid();

        notification.Read = true;
        await _notificationRepository.UpdateAsync(id, notification);
        return Ok(notification);
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        
        var filter = Builders<Models.Notification>.Filter.Eq(n => n.UserId, currentUserId) & 
                     Builders<Models.Notification>.Filter.Eq(n => n.Read, false);
                     
        var update = Builders<Models.Notification>.Update.Set(n => n.Read, true);
        
        await _notificationRepository.UpdateManyAsync(filter, update);
        return Ok();
    }
}