using NSubstitute;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.Exceptions;
using SubSnap.Core.Domain.ValueObjects;

namespace test1.Subscriptions;

public class UpdateSubHandlerTests
{
    private readonly ISubscriptionRepository _repo = Substitute.For<ISubscriptionRepository>();
    private readonly UpdateSubHandler _sut;

    public UpdateSubHandlerTests()
    {
        _sut = new UpdateSubHandler(_repo);
    }

    // helper: crea una subscription valida con un userId specifico
    private static Subscription MakeSub(UserId userId) =>
        new Subscription(userId, "Netflix", 15.99m, "Mensile",
            DateOnly.FromDateTime(DateTime.UtcNow), null, "Streaming");

    [Fact]
    public async Task Handle_OwnerUpdates_ReturnsUpdatedResult()
    {
        var userId = UserId.New();
        var sub = MakeSub(userId);
        var subId = sub.Id;

        _repo.GetByIdAsync(subId, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new UpdateSubCommand(subId, userId, "Netflix Plus", 19.99m, "Annuale", null, "Streaming");

        var result = await _sut.Handle(cmd, CancellationToken.None);

        Assert.Equal("Netflix Plus", result.Name);
        Assert.Equal(19.99m, result.Amount);
        Assert.Equal("Annuale", result.BillingCycle);
    }

    [Fact]
    public async Task Handle_SubscriptionNotFound_ThrowsSubscriptionNotFoundException()
    {
        var subId = SubscriptionId.New();
        var userId = UserId.New();

        _repo.GetByIdAsync(subId, Arg.Any<CancellationToken>()).Returns((Subscription?)null);

        var cmd = new UpdateSubCommand(subId, userId, "X", 1m, "Mensile", null, null);

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

        var cmd = new UpdateSubCommand(sub.Id, attacker, "Hacked", 0m, "Mensile", null, null);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OwnerUpdates_CallsRepositoryUpdateAsync()
    {
        var userId = UserId.New();
        var sub = MakeSub(userId);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new UpdateSubCommand(sub.Id, userId, "Spotify", 9.99m, "Mensile", null, null);

        await _sut.Handle(cmd, CancellationToken.None);

        await _repo.Received(1).UpdateAsync(sub, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_DifferentOwner_DoesNotCallUpdateAsync()
    {
        var realOwner = UserId.New();
        var attacker = UserId.New();
        var sub = MakeSub(realOwner);

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new UpdateSubCommand(sub.Id, attacker, "Hacked", 0m, "Mensile", null, null);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.Handle(cmd, CancellationToken.None));

        await _repo.DidNotReceive().UpdateAsync(Arg.Any<Subscription>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OwnerUpdates_WritesUpdatedHistoryEntry()
    {
        var userId = UserId.New();
        var sub = MakeSub(userId);  // Netflix | 15.99 | Mensile

        _repo.GetByIdAsync(sub.Id, Arg.Any<CancellationToken>()).Returns(sub);

        var cmd = new UpdateSubCommand(sub.Id, userId, "Netflix Plus", 19.99m, "Annuale", null, null);

        await _sut.Handle(cmd, CancellationToken.None);

        await _repo.Received(1).AddHistoryAsync(
            Arg.Is<SubSnap.Core.Domain.Entities.SubscriptionHistory>(h =>
                h.Action == "Updated" &&
                h.OldValue != null && h.OldValue.Contains("Netflix") &&
                h.NewValue != null && h.NewValue.Contains("Netflix Plus")),
            sub.Id,
            Arg.Any<CancellationToken>());
    }
}
