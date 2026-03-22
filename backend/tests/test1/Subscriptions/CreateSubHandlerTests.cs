using NSubstitute;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.UseCases.Subscriptions.CreateSubscription;
using SubSnap.Core.Domain.ValueObjects;

namespace test1.Subscriptions;

public class CreateSubHandlerTests
{
    private readonly ISubscriptionRepository _repo = Substitute.For<ISubscriptionRepository>();
    private readonly CreateSubHandler _sut;

    public CreateSubHandlerTests()
    {
        _sut = new CreateSubHandler(_repo);
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesSubscriptionAndReturnsResult()
    {
        var userId = UserId.New();
        var cmd = new CreateSubCommand(
            userId,
            "Netflix",
            15.99m,
            "Mensile",
            DateOnly.FromDateTime(DateTime.UtcNow),
            null,
            "Streaming");

        var result = await _sut.Handle(cmd, CancellationToken.None);

        await _repo.Received(1).AddAsync(
            Arg.Is<SubSnap.Core.Domain.Entities.Subscription>(s =>
                s.UserId == userId &&
                s.Name == "Netflix" &&
                s.Amount == 15.99m &&
                s.BillingCycle == "Mensile" &&
                s.Category == "Streaming"),
            Arg.Any<CancellationToken>());

        Assert.Equal("Netflix", result.Name);
        Assert.Equal(15.99m, result.Amount);
        Assert.Equal("Mensile", result.BillingCycle);
        Assert.Equal("Streaming", result.Category);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    [Fact]
    public async Task Handle_WithEndDate_SetsEndDateCorrectly()
    {
        var userId = UserId.New();
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1));

        var cmd = new CreateSubCommand(
            userId,
            "Spotify",
            9.99m,
            "Annuale",
            DateOnly.FromDateTime(DateTime.UtcNow),
            endDate,
            null);

        var result = await _sut.Handle(cmd, CancellationToken.None);

        Assert.Equal(endDate, result.EndDate);
        Assert.Null(result.Category);
    }

    [Fact]
    public async Task Handle_CallsRepositoryAddAsync_ExactlyOnce()
    {
        var cmd = new CreateSubCommand(
            UserId.New(),
            "Amazon Prime",
            4.99m,
            "Mensile",
            DateOnly.FromDateTime(DateTime.UtcNow),
            null,
            null);

        await _sut.Handle(cmd, CancellationToken.None);

        await _repo.Received(1).AddAsync(
            Arg.Any<SubSnap.Core.Domain.Entities.Subscription>(),
            Arg.Any<CancellationToken>());
    }
}
