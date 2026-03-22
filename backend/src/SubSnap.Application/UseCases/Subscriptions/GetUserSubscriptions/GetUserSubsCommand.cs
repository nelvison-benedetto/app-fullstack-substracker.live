using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;

public sealed record GetUserSubsCommand(UserId UserId) : IRequest<List<GetUserSubsResult>>;
