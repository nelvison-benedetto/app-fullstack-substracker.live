using NSubstitute;
using SubSnap.Application.Ports.Auth;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.UseCases.Users.UpdateUserProfile;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.Exceptions;
using SubSnap.Core.Domain.ValueObjects;

namespace test1.Users;

public class UpdateUserProfileHandlerTests
{
    private readonly IUserRepository _userRepo = Substitute.For<IUserRepository>();
    private readonly IPasswordHasherService _hasher = Substitute.For<IPasswordHasherService>();
    private readonly UpdateUserProfileHandler _sut;

    public UpdateUserProfileHandlerTests()
    {
        _sut = new UpdateUserProfileHandler(_userRepo, _hasher);
    }

    private static User MakeUser(string email = "user@test.com", string hash = "hashedpw") =>
        new User(new Email(email), new PasswordHash(hash));

    [Fact]
    public async Task Handle_UserNotFound_ThrowsUserNotFoundException()
    {
        var userId = UserId.New();
        _userRepo.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var cmd = new UpdateUserProfileCommand(userId, "new@test.com", null, null);

        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ChangeEmail_UpdatesEmailOnUser()
    {
        var user = MakeUser("old@test.com");
        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _userRepo.FindByEmailAsync(new Email("new@test.com"), Arg.Any<CancellationToken>()).Returns((User?)null);

        var cmd = new UpdateUserProfileCommand(user.Id, "new@test.com", null, null);

        var result = await _sut.Handle(cmd, CancellationToken.None);

        Assert.Equal("new@test.com", result.Email);
    }

    [Fact]
    public async Task Handle_EmailAlreadyTakenByOtherUser_ThrowsEmailAlreadyRegisteredException()
    {
        var user = MakeUser("user@test.com");
        var other = MakeUser("taken@test.com");

        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _userRepo.FindByEmailAsync(new Email("taken@test.com"), Arg.Any<CancellationToken>()).Returns(other);

        var cmd = new UpdateUserProfileCommand(user.Id, "taken@test.com", null, null);

        await Assert.ThrowsAsync<EmailAlreadyRegisteredException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ChangeEmailToSelf_DoesNotThrow()
    {
        // l'utente manda la sua stessa email → FindByEmail ritorna se stesso → nessun conflitto
        var user = MakeUser("user@test.com");
        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _userRepo.FindByEmailAsync(new Email("user@test.com"), Arg.Any<CancellationToken>()).Returns(user);

        var cmd = new UpdateUserProfileCommand(user.Id, "user@test.com", null, null);

        var exception = await Record.ExceptionAsync(
            () => _sut.Handle(cmd, CancellationToken.None));

        Assert.Null(exception);
    }

    [Fact]
    public async Task Handle_ChangePassword_CorrectCurrentPassword_UpdatesHash()
    {
        var user = MakeUser(hash: "current_hash");
        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _hasher.Verify("current_pw", user.PasswordHash).Returns(true);
        _hasher.Hash("new_pw").Returns(new PasswordHash("new_hash"));

        var cmd = new UpdateUserProfileCommand(user.Id, null, "current_pw", "new_pw");

        var result = await _sut.Handle(cmd, CancellationToken.None);

        _hasher.Received(1).Verify("current_pw", Arg.Any<PasswordHash>());
        _hasher.Received(1).Hash("new_pw");
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Handle_ChangePassword_WrongCurrentPassword_ThrowsUnauthorizedAccessException()
    {
        var user = MakeUser();
        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);
        _hasher.Verify(Arg.Any<string>(), Arg.Any<PasswordHash>()).Returns(false);

        var cmd = new UpdateUserProfileCommand(user.Id, null, "wrong_pw", "new_pw");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_NoChanges_ReturnsCurrentUserData()
    {
        var user = MakeUser("user@test.com");
        _userRepo.FindByIdAsync(user.Id, Arg.Any<CancellationToken>()).Returns(user);

        var cmd = new UpdateUserProfileCommand(user.Id, null, null, null);

        var result = await _sut.Handle(cmd, CancellationToken.None);

        Assert.Equal("user@test.com", result.Email);
        Assert.Equal(user.Id.Value, result.Id);
    }
}
