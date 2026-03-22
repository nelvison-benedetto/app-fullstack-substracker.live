namespace SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;

public sealed record GetUserSubsResult(
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
