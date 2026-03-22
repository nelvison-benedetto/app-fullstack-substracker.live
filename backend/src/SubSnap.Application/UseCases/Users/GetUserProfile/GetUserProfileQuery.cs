using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Users.GetUserProfile;

public sealed record GetUserProfileQuery(UserId UserId) : IRequest<GetUserProfileResult>;
