using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;

public sealed record UpdateSubCommand(
    SubscriptionId SubscriptionId,
    UserId UserId,
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly? EndDate,
    string? Category
) : IRequest<UpdateSubResult>;
