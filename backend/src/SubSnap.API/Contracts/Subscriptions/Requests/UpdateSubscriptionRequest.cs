namespace SubSnap.API.Contracts.Subscriptions.Requests;

public sealed record UpdateSubscriptionRequest(
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly? EndDate,
    string? Category
);
