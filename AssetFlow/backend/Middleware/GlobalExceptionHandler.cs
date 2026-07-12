using System.Net;
using System.Text.Json;

namespace AssetFlow.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var statusCode = exception switch
        {
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            AssetFlow.Exceptions.DoubleAllocationException => (int)HttpStatusCode.Conflict,
            AssetFlow.Exceptions.BookingOverlapException => (int)HttpStatusCode.Conflict,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            AssetFlow.Services.InvalidTransitionException => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        object result;

        if (exception is AssetFlow.Exceptions.DoubleAllocationException dae)
        {
            result = new 
            {
                error = "AssetAlreadyAllocated",
                message = dae.Message,
                currentHolderId = dae.CurrentHolderId,
                currentHolderName = dae.CurrentHolderName,
                allocationId = dae.AllocationId
            };
        }
        else if (exception is AssetFlow.Exceptions.BookingOverlapException boe)
        {
            result = new 
            {
                error = "BookingOverlap",
                message = boe.Message,
                conflictingBookingId = boe.ConflictingBookingId,
                conflictingStart = boe.ConflictingStart,
                conflictingEnd = boe.ConflictingEnd
            };
        }
        else
        {
            result = new { error = exception.Message, statusCode = statusCode };
        }

        return context.Response.WriteAsJsonAsync(result);
    }
}