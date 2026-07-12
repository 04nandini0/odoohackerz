using AssetFlow.DTOs;
using AssetFlow.Models;
using AssetFlow.Repositories;
using AssetFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IBookingRepository _bookingRepository;

    public BookingsController(IBookingService bookingService, IBookingRepository bookingRepository)
    {
        _bookingService = bookingService;
        _bookingRepository = bookingRepository;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var booking = await _bookingService.CreateBookingAsync(request, currentUserId);
        return Created("", booking);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? resourceAssetId, [FromQuery] string? bookedBy, [FromQuery] string? status)
    {
        var all = await _bookingRepository.GetAllAsync();
        var query = all.AsQueryable();

        if (!string.IsNullOrEmpty(resourceAssetId)) query = query.Where(b => b.ResourceAssetId == resourceAssetId);
        if (!string.IsNullOrEmpty(bookedBy)) query = query.Where(b => b.BookedBy == bookedBy);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
            query = query.Where(b => b.Status == parsedStatus);

        // Computed status based on current time (per spec constraints)
        // TODO: In a production app, this should be handled by a scheduled background job or Cron.
        var now = DateTime.UtcNow;
        var computedList = query.ToList().Select(b => 
        {
            if (b.Status == BookingStatus.Upcoming && b.StartTime <= now && b.EndTime >= now)
                b.Status = BookingStatus.Ongoing;
            else if ((b.Status == BookingStatus.Upcoming || b.Status == BookingStatus.Ongoing) && b.EndTime < now)
                b.Status = BookingStatus.Completed;
            return b;
        }).ToList();

        return Ok(computedList);
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var isAdmin = User.IsInRole(EmployeeRole.Admin.ToString()) || User.IsInRole(EmployeeRole.AssetManager.ToString());
        
        var booking = await _bookingService.CancelBookingAsync(id, currentUserId, isAdmin);
        return Ok(booking);
    }

    [HttpPut("{id}/reschedule")]
    public async Task<IActionResult> Reschedule(string id, [FromBody] RescheduleBookingRequest request)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var booking = await _bookingService.RescheduleBookingAsync(id, request, currentUserId);
        return Ok(booking);
    }
}
/*
Testing checklist:
- [x] Booking 9:00–10:00 exists → request 9:30–10:30 rejected, request 10:00–11:00 accepted (exact spec scenario)
- [x] Cancelled bookings don't block new bookings in the same slot
- [x] Reschedule excludes the booking's own original slot from its own overlap check
*/