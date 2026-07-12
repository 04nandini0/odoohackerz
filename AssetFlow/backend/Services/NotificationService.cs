using AssetFlow.Hubs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace AssetFlow.Services;

public interface INotificationService
{
    Task NotifyAsync(string userId, NotificationType type, string message, string? entityType = null, string? entityId = null);
    Task BroadcastDashboardUpdateAsync();
}

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(INotificationRepository notificationRepository, IHubContext<NotificationHub> hubContext)
    {
        _notificationRepository = notificationRepository;
        _hubContext = hubContext;
    }

    public async Task NotifyAsync(string userId, NotificationType type, string message, string? entityType = null, string? entityId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Message = message,
            EntityType = entityType,
            EntityId = entityId,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.CreateAsync(notification);

        // Push to client
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", notification);
    }

    public async Task BroadcastDashboardUpdateAsync()
    {
        // Broadcast a tiny signal to all connected clients that KPIs are stale
        await _hubContext.Clients.All.SendAsync("DashboardStale");
    }
}
