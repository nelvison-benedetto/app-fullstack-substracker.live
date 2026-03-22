using NSubstitute;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.UseCases.Subscriptions.DeleteSubscription;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.Exceptions;
using SubSnap.Core.Domain.ValueObjects;

namespace test1.Subscriptions;

public class DeleteSubHandlerTests
{
    private readonly ISubscriptionRepository _repo = Substitute.For<ISubscriptionRepository>();
    private readonly DeleteSubHandler _sut;

    public DeleteSubHandlerTests()
    {
        _sut = new DeleteSubHandler(_repo);
    }

    private static Subscription MakeSub(UserId userId) =>
        new Subscription(userId, "Netflix", 15.99m, "Mensile",
            DateOnly.FromDateTime(DateTime.UtcNow), null, null);

    [Fact]
    public async Task Handle_OwnerDeletes_CallsRepositoryDeleteAsync()
    {
        var userId = UserId.New();
        var sub = MakeSub(userId);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new DeleteSubCommand(sub.Id, userId);

        await _sut.Handle(cmd, CancellationToken.None);

        await _repo.Received(1).DeleteAsync(sub, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_SubscriptionNotFound_ThrowsSubscriptionNotFoundException()
    {
        var subId = SubscriptionId.New();

        _repo.GetByIdAsync(subId, Arg.Any<CancellationToken>()).Returns((Subscription?)null);

        var cmd = new DeleteSubCommand(subId, UserId.New());

        await Assert.ThrowsAsync<SubscriptionNotFoundException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DifferentOwner_ThrowsUnauthorizedAccessException()
    {
        var realOwner = UserId.New();
        var attacker = UserId.New();
        var sub = MakeSub(realOwner);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new DeleteSubCommand(sub.Id, attacker);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DifferentOwner_DoesNotCallDeleteAsync()
    {
        var realOwner = UserId.New();
        var attacker = UserId.New();
        var sub = MakeSub(realOwner);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new DeleteSubCommand(sub.Id, attacker);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.Handle(cmd, CancellationToken.None));

        await _repo.DidNotReceive().DeleteAsync(Arg.Any<Subscription>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OwnerDeletes_DoesNotThrow()
    {
        var userId = UserId.New();
        var sub = MakeSub(userId);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var exception = await Record.ExceptionAsync(
            () => _sut.Handle(new DeleteSubCommand(sub.Id, userId), CancellationToken.None));

        Assert.Null(exception);
    }
}
