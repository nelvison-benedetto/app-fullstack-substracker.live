using Microsoft.EntityFrameworkCore;
using SubSnap.Application.Ports.DataLoadersorQueries;
using SubSnap.Core.Domain.Aggregates;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;
using SubSnap.Infrastructure.Caching;
using SubSnap.Infrastructure.Persistence.Context;

namespace SubSnap.Infrastructure.DataLoaders.Aggregates;

/*
 * PROIEZIONE RUNTIME, load aggregate root (e.g.user) + combinations di CHILDRENS(quindi no altri aggregates roots!e.g.subscriptions) ...
 * assolutamente NON USARE .Include() (mega-join mostruosa)!!
 * 
 * xxxAggregateLoader non conosce i BATCHLOADERS!! è solo un builder.
 * viene chiamato dall' handler/orchestrator.
 * 
see  getuserswithsubscriptionshandler.cs  useraggregateloader.cs  subscriptionbatchloader.cs  userrepository.cs  GUSHandler.cs(top!)
 */
// usa AutoMapper nel .API per e.g.UserAggregate → UserDashboardDTO e passare questo al client.
public sealed class SubscriptionAggregateLoader : ISubscriptionAggregateLoader
{
    private readonly IDbContextFactory<ApplicationDbContext> _factory; //x .WhenAll() cioe query in parallelo
    private readonly QueryCache _cache;

    public SubscriptionAggregateLoader(
        IDbContextFactory<ApplicationDbContext> factory,
        QueryCache cache
    )
    {
        _factory = factory;
        _cache = cache;
    }

    public async Task<SubscriptionSubscriptionHistoriesAggregate?> LoadWithSubscriptionHistoriesAsync(SubscriptionId subscriptionId, CancellationToken ct = default)
    {
        var cacheKey = $"subscription-history:{subscriptionId.Value}";

        if (_cache.TryGet<SubscriptionSubscriptionHistoriesAggregate>(cacheKey, out var cached))
            return cached;

        await using var subscriptionsContext = await _factory.CreateDbContextAsync(ct);
        await using var subscriptionHistoriesContext = await _factory.CreateDbContextAsync(ct);

        var subscriptionTask = subscriptionsContext.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == subscriptionId, ct);

        var subscriptionHistoriesTask = subscriptionHistoriesContext.Set<SubscriptionHistory>()
            .AsNoTracking()
            .Where(sh => EF.Property<SubscriptionId>(sh, "SubscriptionId") == subscriptionId)
            .ToListAsync(ct);

        await Task.WhenAll( subscriptionTask, subscriptionHistoriesTask );

        if (subscriptionTask.Result == null)
            return null;

        var aggregate = new SubscriptionSubscriptionHistoriesAggregate(
            subscriptionTask.Result,
            subscriptionHistoriesTask.Result
        );

        _cache.Set(cacheKey, aggregate);

        return aggregate;
    }

}
