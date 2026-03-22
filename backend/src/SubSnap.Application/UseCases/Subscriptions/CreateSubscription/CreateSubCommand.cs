using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Subscriptions.CreateSubscription;

public sealed record CreateSubCommand(
    UserId UserId,
    string Name,
    decimal Amount,
    string BillingCycle,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? Category
) : IRequest<CreateSubResult>;
