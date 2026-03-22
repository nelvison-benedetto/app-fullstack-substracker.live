using MediatR;
using SubSnap.Application.Ports.DataLoadersorQueries;

namespace SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;

/*
 * QUERY ottimizzata al massimo:
 * - usa SubscriptionBatchLoader: accumula N req -> 1 SELECT WHERE userid = @id
 * - AsNoTracking implicito nel batchloader (factory context)
 * - nessun .Include(), nessun join inutile
 *
 * Controller -> GetUserSubsOrchestrator -> MediatR pipeline -> GetUserSubsHandler -> BatchLoader -> DB
 */
public sealed class GetUserSubsHandler : IRequestHandler<GetUserSubsCommand, List<GetUserSubsResult>>
{
    private readonly ISubscriptionBatchLoader _batchLoader;

    public GetUserSubsHandler(ISubscriptionBatchLoader batchLoader)
    {
        _batchLoader = batchLoader;
    }

    public async Task<List<GetUserSubsResult>> Handle(GetUserSubsCommand cmd, CancellationToken ct)
    {
        var subs = await _batchLoader.Load(cmd.UserId, ct);

        return subs
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new GetUserSubsResult(
                s.Id.Value,
                s.Name,
                s.Amount,
                s.BillingCycle,
                s.StartDate,
                s.EndDate,
                s.Category,
                s.CreatedAt,
                s.UpdatedAt))
            .ToList();
    }
}
