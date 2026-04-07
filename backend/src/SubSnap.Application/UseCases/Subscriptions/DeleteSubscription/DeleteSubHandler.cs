using MediatR;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Exceptions;

namespace SubSnap.Application.UseCases.Subscriptions.DeleteSubscription;

public sealed class DeleteSubHandler : IRequestHandler<DeleteSubCommand>
{
    private readonly ISubscriptionRepository _repo;

    public DeleteSubHandler(ISubscriptionRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteSubCommand cmd, CancellationToken ct)
    {
        var sub = await _repo.GetByIdAsync(cmd.SubscriptionId, ct)
            ?? throw new SubscriptionNotFoundException(cmd.SubscriptionId);

        // ownership check
        if (sub.UserId != cmd.UserId)
            throw new UnauthorizedAccessException();

        // delete histories first to avoid FK constraint violation
        // (subscriptionhistories.subscriptionid FK was created without ON DELETE CASCADE)
        await _repo.DeleteHistoriesBySubscriptionIdAsync(cmd.SubscriptionId, ct);
        await _repo.DeleteAsync(sub, ct);
    }
}
