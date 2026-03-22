using MediatR;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Users.UpdateUserProfile;

public sealed record UpdateUserProfileCommand(
    UserId UserId,
    string? NewEmail,
    string? CurrentPassword,
    string? NewPassword
) : IRequest<UpdateUserProfileResult>;
