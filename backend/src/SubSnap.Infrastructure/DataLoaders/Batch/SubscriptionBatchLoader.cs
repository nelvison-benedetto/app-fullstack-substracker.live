using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubSnap.Application.Ports.DataLoadersorQueries;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;
using SubSnap.Infrastructure.Persistence.Context;
using System.Collections.Concurrent;
using System.Diagnostics;

namespace SubSnap.Infrastructure.DataLoaders.Batch;

/*
 * ottimizza query READS multiple simultanee: N richieste -> 1 query!
 * RISOLVE PROBLEMA e.g. 100 users -> 100 query per prendere le subscription di ogni user, invece fai 1 sola query che prende tutte le subscription dei 100 users in una volta sola, e poi distribuisce i risultati a ciascuna richiesta originale.
 * 
 * NON SONO query parallele(quer1 - query2 ...tutte in parallelo. db overload!!)! sono CUNCURRENT BATCHED (requests parallele -> 1 sola query ottimizzata! db happy!!), 
 * 
 * per utilizzarlo fai 
var tasks = users.Select(u =>
    _subscriptionLoader.Load(u.Id, ct));
var subscriptions = await Task.WhenAll(tasks);

viene chiamato dall'handler.
Handler / Orchestrator
       ↓
SubscriptionBatchLoader.Load(userId)
       ↓
pending dictionary
       ↓ (5ms)
ExecuteBatch()
       ↓
SELECT ... WHERE UserId IN (...)

see  getuserswithsubscriptionshandler.cs  useraggregateloader.cs  subscriptionbatchloader.cs  userrepository.cs  GUSHandler.cs(top!)
 */
//this è fatto identico a come se usassi GraphQL DataLoader.top.

public sealed class SubscriptionBatchLoader : ISubscriptionBatchLoader
{
    private readonly IDbContextFactory<ApplicationDbContext> _factory;
    private readonly ILogger<SubscriptionBatchLoader> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;  //x leggere correlationId dal middleware corrente

    private readonly ConcurrentDictionary<Guid, TaskCompletionSource<IReadOnlyList<Subscription>>> _pending = new();
    /*TaskCompletionSource è un promise manuale, tu prometti 'ti darò il risultato piu tardi'.
    quindi _pending contiene UserId → promessa del risultato, 
    e.g.
    user1 → TaskCompletionSource
    user2 → TaskCompletionSource
    user3 → TaskCompletionSource
    */

    private bool _scheduled;
    private readonly object _lock = new();

    public SubscriptionBatchLoader(
        IDbContextFactory<ApplicationDbContext> factory,
        ILogger<SubscriptionBatchLoader> logger,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _factory = factory;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public Task<IReadOnlyList<Subscription>> Load(
        UserId userId,
        CancellationToken ct = default)
    {
        _logger.LogDebug(
            "Batch request queued for UserId {UserId}",
            userId.Value);
        //logging ok.

        var key = userId.Value; //serve per raggruppare le req duplicate

        var tcs = _pending.GetOrAdd( key, _ => new TaskCompletionSource<IReadOnlyList<Subscription>>(TaskCreationOptions.RunContinuationsAsynchronously));
        /*dice 'se già qualcuno ha chiesto questo user → riusa promessa, altrimenti creala.'
         * e.g.
         se arrivano 3 req
         Load(user1)
         Load(user1)
         Load(user1)
        non crei 3 req, ma ne crei solo 1.
         */

        ScheduleExecution(ct);  //serve ad evitare 100 req -> 100 query
        //dice "Ok, prima o poi eseguiamo la query batch"

        return tcs.Task;  //ritorni una Task NON ancora completata
    }

    private void ScheduleExecution(CancellationToken ct = default)
    {
        lock (_lock)
        {
            if (_scheduled) return;
            _scheduled = true;
        }
        //garantisce solo 1 batch running attivo!!

        _ = Task.Run(() => ExecuteBatch(ct), ct);  //parte in background
    }
    
    private async Task ExecuteBatch(CancellationToken ct = default)
    {
        try
        {
            await Task.Delay(5, ct); //aspetti 5ms, perche serve un po di tempo x raccogliere le req simultanee. e.g. t=0ms user1 t=1ms user2 t=3ms user3...

            var snapshot = _pending.ToArray(); //'congeli' le req attuali (lo stato attuale)
            var ids = snapshot.Select(x => x.Key).ToList();           // List<Guid> — raw keys for grouping/lookup
            var userIdObjects = ids.Select(g => new UserId(g)).ToList(); // List<UserId> — for EF Core LINQ translation

            await using var db =
                await _factory.CreateDbContextAsync(ct);

            //OLD before logging x batch loader
            //var subs = await db.Set<Subscription>()
            //    .Where(s => ids.Contains(
            //        EF.Property<Guid>(s, "UserId")))
            //    .ToListAsync();
            //var grouped = subs
            //    .GroupBy(s =>
            //        EF.Property<Guid>(s, "UserId"))
            //    .ToDictionary(g => g.Key, g =>
            //        (IReadOnlyList<Subscription>)g.ToList());
            //foreach (var (id, tcs) in snapshot)
            //{
            //    grouped.TryGetValue(id, out var result);
            //    tcs.TrySetResult(result ?? new List<Subscription>());
            //    _pending.TryRemove(id, out _);
            //}
            //lock (_lock)
            //    _scheduled = false;

            //LOGGING SPECIFICO anche X BATCH LOADERS
            // Recupero CorrelationId dal contesto HTTP

            var correlationId = _httpContextAccessor.HttpContext?.Items["CorrelationId"]
                ?? _httpContextAccessor.HttpContext?.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                ?? Guid.NewGuid().ToString();
            //x leggere correlationId dal middleware [INFO]

            using (_logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Batch"] = "SubscriptionLoader"
            })) //aggiunge auto CorrelationId Batch=SubscriptionLoader a tutti i logs all'interno
            {
                _logger.LogInformation(
                    "Executing subscription batch query for {Count} users",
                    ids.Count);

                var sw = Stopwatch.StartNew();  //x performace monitoring in tempo reale. see performancebehvior.cs

                var subs = await db.Set<Subscription>()
                    .Where(s => userIdObjects.Contains(s.UserId))
                    .ToListAsync();
                //1 QUERY SOLA!!

                sw.Stop();

                _logger.LogInformation(
                    "Batch query completed in {ElapsedMs}ms returning {Rows} rows",
                    sw.ElapsedMilliseconds,
                    subs.Count);

                var grouped = subs
                    .GroupBy(s => s.UserId.Value)
                    .ToDictionary(g => g.Key, g => (IReadOnlyList<Subscription>)g.ToList());
                /*
                 trasformi [subscription1, subscription2, ...] in
                 user1 → [sub1, sub2]
                 user2 → [sub3]
                 */

                foreach (var (id, tcs) in snapshot)
                {
                    grouped.TryGetValue(id, out var result);
                    tcs.TrySetResult(result ?? new List<Subscription>());
                    //QUI COMPLETI OGNI TASK, e CHI AVEVA FATTO await Load() RICEVE IL RISULTATO!
                    _pending.TryRemove(id, out _);
                    //CLEANUP, rimuovi dal dizionario
                }
                
            }
        }
        catch (Exception ex)
        {
            foreach (var (_, tcs) in _pending)
            {
                tcs.TrySetException(ex);
            }
            _pending.Clear();
            _logger.LogError(ex, "Subscription batch loader failed");
        }
        finally { 
            lock (_lock)
                _scheduled = false; 
            //RESET, permette prossimi batch
        }

    }


}