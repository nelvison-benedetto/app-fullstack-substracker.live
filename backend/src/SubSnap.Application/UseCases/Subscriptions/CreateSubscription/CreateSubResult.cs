namespace SubSnap.Application.UseCases.Subscriptions.CreateSubscription;

public sealed record CreateSubResult(
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
