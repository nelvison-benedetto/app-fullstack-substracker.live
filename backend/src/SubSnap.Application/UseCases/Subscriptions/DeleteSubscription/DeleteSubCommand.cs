using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Subscriptions.DeleteSubscription;

public sealed record DeleteSubCommand(
    SubscriptionId SubscriptionId,
    UserId UserId
) : IRequest;
