using MediatR;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Entities;

namespace SubSnap.Application.UseCases.Subscriptions.CreateSubscription;

public sealed class CreateSubHandler : IRequestHandler<CreateSubCommand, CreateSubResult>
{
    private readonly ISubscriptionRepository _repo;

    public CreateSubHandler(ISubscriptionRepository repo)
    {
        _repo = repo;
    }

    public async Task<CreateSubResult> Handle(CreateSubCommand cmd, CancellationToken ct)
    {
        var sub = new Subscription(
            cmd.UserId,
            cmd.Name,
            cmd.Amount,
            cmd.BillingCycle,
            cmd.StartDate,
            cmd.EndDate,
            cmd.Category);

        await _repo.AddAsync(sub, ct);
        //savechangesasync e' nel transactionbehavior.cs

        return new CreateSubResult(
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
