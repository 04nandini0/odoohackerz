using AssetFlow.DTOs;
using AssetFlow.Exceptions;
using AssetFlow.Models;
using AssetFlow.Repositories;

namespace AssetFlow.Services;

public interface IBookingService
{
    Task<Booking> CreateBookingAsync(CreateBookingRequest request, string currentUserId);
    Task<Booking> RescheduleBookingAsync(string bookingId, RescheduleBookingRequest request, string currentUserId);
    Task<Booking> CancelBookingAsync(string bookingId, string currentUserId, bool isAdmin);
}

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IAssetRepository _assetRepository;

    public BookingService(IBookingRepository bookingRepository, IAssetRepository assetRepository)
    {
        _bookingRepository = bookingRepository;
        _assetRepository = assetRepository;
    }

    /// <summary>
    /// Overlap Validation Logic
    /// A new booking [newStart, newEnd) conflicts with an existing [start, end) if: newStart < end AND newEnd > start
    /// 
    /// Examples based on spec:
    /// Existing Booking: 9:00 - 10:00
    /// 
    /// Scenario 1 (Reject): Request 9:30 - 10:30
    /// newStart(9:30) < end(10:00) => TRUE
    /// newEnd(10:30) > start(9:00) => TRUE
    /// Conflict: TRUE
    /// 
    /// Scenario 2 (Accept - back-to-back): Request 10:00 - 11:00
    /// newStart(10:00) < end(10:00) => FALSE
    /// Conflict: FALSE
    /// </summary>
    private async Task ValidateOverlapAsync(string resourceAssetId, DateTime newStart, DateTime newEnd, string? excludeBookingId = null)
    {
        if (newStart >= newEnd)
            throw new ArgumentException("StartTime must be before EndTime.");

        if (newStart < DateTime.UtcNow.AddMinutes(-5)) // Small grace period
            throw new ArgumentException("StartTime cannot be in the past.");

        var activeBookings = await _bookingRepository.GetActiveBookingsByAssetIdAsync(resourceAssetId);

        foreach (var existing in activeBookings)
        {
            if (excludeBookingId != null && existing.Id == excludeBookingId)
                continue;

            if (newStart < existing.EndTime && newEnd > existing.StartTime)
            {
                throw new BookingOverlapException(
                    "This resource is already booked during the requested time",
                    existing.Id,
                    existing.StartTime.ToString("o"),
                    existing.EndTime.ToString("o")
                );
            }
        }
    }

    public async Task<Booking> CreateBookingAsync(CreateBookingRequest request, string currentUserId)
    {
        var asset = await _assetRepository.GetByIdAsync(request.ResourceAssetId);
        if (asset == null || !asset.IsBookable)
            throw new ArgumentException("Invalid asset or asset is not bookable.");

        await ValidateOverlapAsync(request.ResourceAssetId, request.StartTime, request.EndTime);

        var booking = new Booking
        {
            ResourceAssetId = request.ResourceAssetId,
            BookedBy = currentUserId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Purpose = request.Purpose,
            Status = BookingStatus.Upcoming
        };

        await _bookingRepository.CreateAsync(booking);
        return booking;
    }

    public async Task<Booking> RescheduleBookingAsync(string bookingId, RescheduleBookingRequest request, string currentUserId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new ArgumentException("Booking not found.");

        if (booking.BookedBy != currentUserId)
            throw new UnauthorizedAccessException("Only the creator can reschedule this booking.");

        if (booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot reschedule cancelled or completed bookings.");

        await ValidateOverlapAsync(booking.ResourceAssetId, request.NewStartTime, request.NewEndTime, booking.Id);

        booking.StartTime = request.NewStartTime;
        booking.EndTime = request.NewEndTime;
        booking.UpdatedAt = DateTime.UtcNow;

        // Reset to upcoming if it was somehow ongoing but pushed to future
        if (booking.StartTime > DateTime.UtcNow)
            booking.Status = BookingStatus.Upcoming;

        await _bookingRepository.UpdateAsync(booking.Id, booking);
        return booking;
    }

    public async Task<Booking> CancelBookingAsync(string bookingId, string currentUserId, bool isAdmin)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new ArgumentException("Booking not found.");

        if (booking.BookedBy != currentUserId && !isAdmin)
            throw new UnauthorizedAccessException("Only the creator or an admin can cancel this booking.");

        booking.Status = BookingStatus.Cancelled;
        booking.UpdatedAt = DateTime.UtcNow;

        await _bookingRepository.UpdateAsync(booking.Id, booking);
        return booking;
    }
}
