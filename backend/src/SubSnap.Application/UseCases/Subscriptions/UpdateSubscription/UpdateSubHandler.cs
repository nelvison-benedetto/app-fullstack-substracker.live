using MediatR;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Exceptions;

namespace SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;

public sealed class UpdateSubHandler : IRequestHandler<UpdateSubCommand, UpdateSubResult>
{
    private readonly ISubscriptionRepository _repo;

    public UpdateSubHandler(ISubscriptionRepository repo)
    {
        _repo = repo;
    }

    public async Task<UpdateSubResult> Handle(UpdateSubCommand cmd, CancellationToken ct)
    {
        var sub = await _repo.GetByIdAsync(cmd.SubscriptionId, ct)
            ?? throw new SubscriptionNotFoundException(cmd.SubscriptionId);

        //ownership check: la subscription deve appartenere all'utente richiedente
        if (sub.UserId != cmd.UserId)
            throw new UnauthorizedAccessException();

        sub.Update(cmd.Name, cmd.Amount, cmd.BillingCycle, cmd.Category, cmd.EndDate);

        await _repo.UpdateAsync(sub, ct);
        //savechangesasync e' nel transactionbehavior.cs

        return new UpdateSubResult(
            sub.Id.Value,
            sub.Name,
            sub.Amount,
            sub.BillingCycle,
            sub.StartDate,
            sub.EndDate,
            sub.Category,
            sub.CreatedAt,
            sub.UpdatedAt);
    }
}
