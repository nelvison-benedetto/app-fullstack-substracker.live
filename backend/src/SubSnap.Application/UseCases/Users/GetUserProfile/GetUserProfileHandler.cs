using MediatR;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Exceptions;

namespace SubSnap.Application.UseCases.Users.GetUserProfile;

public sealed class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, GetUserProfileResult>
{
    private readonly IUserRepository _userRepository;

    public GetUserProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<GetUserProfileResult> Handle(GetUserProfileQuery query, CancellationToken ct)
    {
        var user = await _userRepository.FindByIdAsync(query.UserId, ct)
            ?? throw new UserNotFoundException(query.UserId);

        return new GetUserProfileResult(
            user.Id.Value,
            user.Email.Value,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt,
            user.LastLogin);
    }
}
