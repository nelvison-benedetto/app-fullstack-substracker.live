namespace SubSnap.API.Contracts.Subscriptions.Requests;

public sealed record CreateSubscriptionRequest(
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Category
);
