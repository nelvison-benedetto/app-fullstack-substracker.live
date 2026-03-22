using MediatR;
using SubSnap.Application.Ports.Auth;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Exceptions;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.UseCases.Users.UpdateUserProfile;

public sealed class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand, UpdateUserProfileResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasherService _hasher;

    public UpdateUserProfileHandler(
        IUserRepository userRepository,
        IPasswordHasherService hasher)
    {
        _userRepository = userRepository;
        _hasher = hasher;
    }

    public async Task<UpdateUserProfileResult> Handle(UpdateUserProfileCommand cmd, CancellationToken ct)
    {
        var user = await _userRepository.FindByIdAsync(cmd.UserId, ct)
            ?? throw new UserNotFoundException(cmd.UserId);

        if (cmd.NewEmail is not null)
        {
            var existing = await _userRepository.FindByEmailAsync(new Email(cmd.NewEmail), ct);
            if (existing is not null && existing.Id != user.Id)
                throw new EmailAlreadyRegisteredException(cmd.NewEmail);
            user.UpdateEmail(new Email(cmd.NewEmail));
        }

        if (cmd.NewPassword is not null && cmd.CurrentPassword is not null)
        {
            if (!_hasher.Verify(cmd.CurrentPassword, user.PasswordHash))
                throw new UnauthorizedAccessException("Current password is incorrect.");
            var newHash = _hasher.Hash(cmd.NewPassword);
            user.UpdatePassword(newHash);
        }

        //savechangesasync e' nel transactionbehavior.cs

        return new UpdateUserProfileResult(
            user.Id.Value,
            user.Email.Value,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt,
            user.LastLogin);
    }
}
