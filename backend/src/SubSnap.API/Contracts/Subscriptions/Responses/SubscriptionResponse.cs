namespace SubSnap.API.Contracts.Subscriptions.Responses;

public sealed record SubscriptionResponse(
    Guid Id,
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
