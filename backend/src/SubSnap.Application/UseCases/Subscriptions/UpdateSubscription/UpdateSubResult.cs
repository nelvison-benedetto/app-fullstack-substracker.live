namespace SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;

public sealed record UpdateSubResult(
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
