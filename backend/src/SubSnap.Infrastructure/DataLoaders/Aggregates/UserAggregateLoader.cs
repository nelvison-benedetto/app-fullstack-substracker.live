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
public sealed class UserAggregateLoader : IUserAggregateLoader
{
    private readonly IDbContextFactory<ApplicationDbContext> _factory; //x .WhenAll() cioe query in parallelo
    private readonly QueryCache _cache;

    public UserAggregateLoader(
        IDbContextFactory<ApplicationDbContext> factory,
        QueryCache cache
    )
    {
        _factory = factory;
        _cache = cache;
    }

    public async Task<UserFullAggregate?> LoadWithFullAsync(
        UserId userId, 
        CancellationToken ct = default
    )
    {
        var cacheKey = $"user-full:{userId.Value}";

        if (_cache.TryGet<UserFullAggregate>(cacheKey, out var cached)) //se gia in cache, restituisco subito, altrimenti faccio tutto il seguente processo di load!!
            return cached;

        await using var userContext = await _factory.CreateDbContextAsync(ct);
        await using var refreshContext = await _factory.CreateDbContextAsync(ct);
        await using var linkContext = await _factory.CreateDbContextAsync(ct);

        var userTask = userContext.Users  //senza 'await' here!!
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        //query 1

        //parallel loads dei childrens target
        var refreshTokensTask = refreshContext.Set<RefreshToken>()
            .AsNoTracking()
            .Where(rt => EF.Property<UserId>(rt, "UserId") == userId)
            .ToListAsync(ct);
        //query 2

        var sharedLinksTask = linkContext.Set<SharedLink>()
            .AsNoTracking()
            .Where(sl => EF.Property<UserId>(sl, "UserId") == userId)
            .ToListAsync(ct);
        //query 3

        await Task.WhenAll(userTask, refreshTokensTask, sharedLinksTask);  //run queries in parallelo!!
        //Thread A → context #1 → SELECT users ...
        //Thread B → context #2 → SELECT refreshtokens...
        //Thread C → context #3 → SELECT sharedlinks...
        //db lavora meglio perche ha query piccole su threads diversi(in questo caso il db riceve 2 threads e li runna CONTEMPORANEAMENTE (PARALLELISMO)), non 1 mega join!!
        //NB: se avessi usato .Include() avrei fatto 1 mega query con 2 LEFT JOIN, e il db avrebbe fatto tutto in 1 thread, e sarebbe stato molto più lento!!
        //esegue le 2 query in parallelo, aspettando che entrambe siano completate prima di procedere.

        if (userTask.Result == null)
        {
            _cache.Set<UserFullAggregate?>(cacheKey, null);
            return null;
        }

        var aggregate = new UserFullAggregate(
            userTask.Result,
            refreshTokensTask.Result,
            sharedLinksTask.Result
        );  //costruzione aggregate, e lo restituisco!(questo obj non esiste nel db, è un runtime business projection)

        _cache.Set(cacheKey, aggregate);

        return aggregate;
    }

    public async Task<UserSharedLinksAggregate?> LoadWithSharedLinksAsync(UserId userId, CancellationToken ct = default)
    {
        var cacheKey = $"user-sharedlinks:{userId.Value}";

        if (_cache.TryGet<UserSharedLinksAggregate>(cacheKey, out var cached))
            return cached;

        await using var userContext = await _factory.CreateDbContextAsync(ct);
        await using var linkContext = await _factory.CreateDbContextAsync(ct);

        var userTask = userContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        var sharedLinksTask = linkContext.Set<SharedLink>()
            .AsNoTracking()
            .Where(sl => EF.Property<UserId>(sl, "UserId") == userId)
            .ToListAsync(ct);

        await Task.WhenAll( userTask, sharedLinksTask );

        if (userTask.Result == null)
        {
            _cache.Set<UserSharedLinksAggregate?>(cacheKey, null);
            return null;
        }

        var aggregate = new UserSharedLinksAggregate(
            userTask.Result,
            sharedLinksTask.Result
        );

        _cache.Set(cacheKey, aggregate);

        return aggregate;
    }

}
