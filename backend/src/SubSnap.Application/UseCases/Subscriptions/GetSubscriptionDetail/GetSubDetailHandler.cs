using MediatR;
using SubSnap.Application.Ports.DataLoadersorQueries;
using SubSnap.Core.Domain.Exceptions;

namespace SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;

/*
 * Usa SubscriptionAggregateLoader (parallel queries via IDbContextFactory):
 *   Thread A -> SELECT subscriptions WHERE id = @id
 *   Thread B -> SELECT subscriptionhistories WHERE subscriptionid = @id
 *   await Task.WhenAll(...)  -> DB lavora su 2 connessioni parallele
 *   + QueryCache request-scoped (50-300ms, evita doppie query nella stessa request)
 */
public sealed class GetSubDetailHandler : IRequestHandler<GetSubDetailCommand, GetSubDetailResult>
{
    private readonly ISubscriptionAggregateLoader _loader;

    public GetSubDetailHandler(ISubscriptionAggregateLoader loader)
    {
        _loader = loader;
    }

    public async Task<GetSubDetailResult> Handle(GetSubDetailCommand cmd, CancellationToken ct)
    {
        var aggregate = await _loader.LoadWithSubscriptionHistoriesAsync(cmd.SubscriptionId, ct)
            ?? throw new SubscriptionNotFoundException(cmd.SubscriptionId);

        //ownership check
        if (aggregate.Subscription.UserId != cmd.UserId)
            throw new UnauthorizedAccessException();

        return new GetSubDetailResult(
            aggregate.Subscription.Id.Value,
            aggregate.Subscription.Name,
            aggregate.Subscription.Amount,
            aggregate.Subscription.BillingCycle,
            aggregate.Subscription.StartDate,
            aggregate.Subscription.EndDate,
            aggregate.Subscription.Category,
            aggregate.Subscription.CreatedAt,
            aggregate.Subscription.UpdatedAt,
            aggregate.History
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new SubHistoryItemResult(
                    h.Id.Value,
                    h.Action,
                    h.OldValue,
                    h.NewValue,
                    h.CreatedAt))
                .ToList());
    }
}
