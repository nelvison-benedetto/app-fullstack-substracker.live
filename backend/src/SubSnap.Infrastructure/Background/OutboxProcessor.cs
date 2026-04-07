using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sentry;
using SubSnap.Infrastructure.Persistence.Context;
using System.Text.Json;

namespace SubSnap.Infrastructure.Background;

/*
 * OUTBOX pattern
 senza puo accadere nel flow
Save User OK
Publish Event -> Send Email CRASH

con outbox invece
Transaction:
   Save User
   Save OutboxMessage
COMMIT OK

Background Worker:
   reads Outbox
   publishes event
//se email fallisce, il record rimane nell'outbox e puo essere ritentato, senza rischiare inconsistenza della transazione
 */

//see User.cs  transactionbehavior.cs efunitofwork.cs  outboxprocessor.cs outboxmessage.cs

public sealed class OutboxProcessor : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxProcessor> _logger;

    public OutboxProcessor(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // POLLING QUASI DISABILITATO: nessun evento di dominio implementato al momento.
        // Aumentati i delay per ridurre il carico CPU/DB sul server (4GB RAM).
        // Per riabilitare: rimetti il delay iniziale a 10s e i delay interni a 500ms/5s.
        await Task.Delay(TimeSpan.FromHours(24), ct);  // startup delay molto lungo: evita che giri inutilmente

        while (!ct.IsCancellationRequested)  //LOOP INFINITO che continua a leggere i messaggi dall'outbox finche il servizio e attivo
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();  //crei scope manuale, xk backgrounservice e singleton, e applicationdbcontext e scoped, quindi devi creare scope manuale per risolverlo

                var db = scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>(); //nuovo dbcontext per ogni ciclo, cosi eviti problemi di concorrenza

                var mediator = scope.ServiceProvider
                    .GetRequiredService<IMediator>(); //risolto dallo scope, non dal costruttore (singleton safety)

                //!! TRANSACTION + FOR UPDATE SKIP LOCKED = claiming atomico !!
                //Garantisce che se girano piu worker (es. restart Docker/Coolify),
                //ognuno prende righe DIVERSE. Nessun duplicato, nessuna race condition.
                await using var transaction = await db.Database.BeginTransactionAsync(ct);

                var messages = await db.OutboxMessages
                    .FromSqlRaw(@"
                        SELECT *
                        FROM outboxmessages
                        WHERE processedonutc IS NULL
                        ORDER BY occurredonutc
                        FOR UPDATE SKIP LOCKED
                        LIMIT 20")
                    .ToListAsync(ct);
                //FOR UPDATE = locka le righe lette, nessun altro worker puo toccarle finche non facciamo commit
                //SKIP LOCKED = se un'altra istanza le ha gia lockate, le salta (invece di aspettare)
                //Risultato: ogni worker processa righe diverse, zero duplicati

                if (!messages.Any())
                {
                    await transaction.RollbackAsync(ct);
                    await Task.Delay(TimeSpan.FromHours(1), ct);  // nessun messaggio -> aspetta 1 ora (era 5s)
                    continue;
                }

                foreach (var msg in messages)
                {
                    var type = Type.GetType(msg.Type)!;  //!!xk devi salvare AssemblyQualifiedName del tipo, cosi puoi deserializzare correttamente l'evento di dominio, anche se hai piu eventi con lo stesso nome in assembly diversi. non .Name xk altrimenti in produzione fallira!

                    var domainEvent = JsonSerializer.Deserialize(msg.Payload, type);
                    //deserializzazione evento di dominio, cosi ricostruisci l'evento di dominio originale a partire dal payload JSON salvato nell'outbox

                    await mediator.Publish((INotification)domainEvent!, ct);  //TROVA TUTTI GLI EVENTHANDLERS REGISTRATI PER QUELL'EVENTO, E LI ESEGUE.

                    msg.ProcessedOnUtc = DateTime.UtcNow;  //lo marchi (see OutboxMessage.cs)

                    _logger.LogDebug("Outbox message {MessageId} of type {MessageType} processed", msg.Id, msg.Type);
                }

                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);  //commit -> rilascia i lock FOR UPDATE
            }
            catch (Exception ex)
            {
                //Cattura esplicita: il background service non passa per la HTTP pipeline,
                //quindi Sentry non lo vedrebbe senza questa chiamata.
                SentrySdk.CaptureException(ex);
                _logger.LogError(ex, "Outbox processor encountered an error while processing messages");
                await Task.Delay(TimeSpan.FromMinutes(30), ct);  // backoff su errore (era 5s)
                continue;
            }

            await Task.Delay(TimeSpan.FromHours(1), ct);  // dopo aver processato messaggi -> aspetta 1 ora (era 500ms)
        }
    }
}
