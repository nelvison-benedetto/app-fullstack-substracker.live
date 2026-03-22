namespace SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;

public sealed record GetSubDetailResult(
    Guid Id,
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<SubHistoryItemResult> History
);

public sealed record SubHistoryItemResult(
    Guid Id,
    string Action,
    string? OldValue,
    string? NewValue,
    DateTime CreatedAt
);
