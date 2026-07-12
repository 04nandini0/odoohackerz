namespace AssetFlow.Exceptions;

public class DoubleAllocationException : Exception
{
    public string CurrentHolderId { get; }
    public string CurrentHolderName { get; }
    public string AllocationId { get; }

    public DoubleAllocationException(string message, string currentHolderId, string currentHolderName, string allocationId) 
        : base(message)
    {
        CurrentHolderId = currentHolderId;
        CurrentHolderName = currentHolderName;
        AllocationId = allocationId;
    }
}

public class BookingOverlapException : Exception
{
    public string ConflictingBookingId { get; }
    public string ConflictingStart { get; }
    public string ConflictingEnd { get; }

    public BookingOverlapException(string message, string conflictingBookingId, string conflictingStart, string conflictingEnd) 
        : base(message)
    {
        ConflictingBookingId = conflictingBookingId;
        ConflictingStart = conflictingStart;
        ConflictingEnd = conflictingEnd;
    }
}
