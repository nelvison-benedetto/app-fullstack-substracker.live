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

        if (_cache.TryGet<SubscriptionSubscriptionHistoriesAggregate>(cacheKey, out var cached)) //se gia in cache, restituisco subito, altrimenti faccio tutto il seguente processo di load!!
            return cached;

        await using var subscriptionsContext = await _factory.CreateDbContextAsync(ct);
        await using var subscriptionHistoriesContext = await _factory.CreateDbContextAsync(ct);

        var subscriptionTask = subscriptionsContext.Subscriptions  //senza 'await'!
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == subscriptionId, ct);
        //query 1: carica solo subscription, senza include di subscription histories (xk sarebbe mega-join mostruoso!!)

        var subscriptionHistoriesTask = subscriptionHistoriesContext.Set<SubscriptionHistory>()
            .AsNoTracking()
            .Where(sh => EF.Property<SubscriptionId>(sh, "SubscriptionId") == subscriptionId)
            .ToListAsync(ct);
        //query 2: carica tutte le subscription histories relative a quella subscription, filtrando per SubscriptionId (xk è FK)

        await Task.WhenAll( subscriptionTask, subscriptionHistoriesTask );
        //esegue le 2 query in parallelo, aspettando che entrambe siano completate prima di procedere.

        if (subscriptionTask.Result == null)
            return null;

        var aggregate = new SubscriptionSubscriptionHistoriesAggregate(
            subscriptionTask.Result,
            subscriptionHistoriesTask.Result
        );
        //creo aggregate 

        _cache.Set(cacheKey, aggregate);  //cacheo l'aggregate con la chiave specifica, in modo che possa essere recuperato più velocemente in futuro senza dover eseguire nuovamente le query al database.

        return aggregate;
    }

}
