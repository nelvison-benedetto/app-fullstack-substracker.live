namespace SubSnap.API.Contracts.Subscriptions.Responses;

public sealed record SubscriptionDetailResponse(
    Guid Id,
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<SubHistoryItemResponse> History
);

public sealed record SubHistoryItemResponse(
    Guid Id,
    string Action,
    string? OldValue,
    string? NewValue,
    DateTime CreatedAt
);
