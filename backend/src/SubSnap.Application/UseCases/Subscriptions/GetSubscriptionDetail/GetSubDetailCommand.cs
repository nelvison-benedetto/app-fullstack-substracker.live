using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;

public sealed record GetSubDetailCommand(
    SubscriptionId SubscriptionId,
    UserId UserId
) : IRequest<GetSubDetailResult>;
