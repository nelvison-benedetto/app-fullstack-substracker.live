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
    private readonly IMediator _mediator;
    private readonly ILogger<OutboxProcessor> _logger;

    public OutboxProcessor(
        IServiceScopeFactory scopeFactory,
        IMediator mediator,
        ILogger<OutboxProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _mediator = mediator;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await Task.Delay(TimeSpan.FromSeconds(10), ct);  //!!importante un delay!! xk seno il db online appena parte l'applicazione non e ancora totalmente caricato, dargli tempo x caricare il db!!

        while (!ct.IsCancellationRequested)  //LOOP INFINITO che continua a leggere i messaggi dall'outbox finche il servizio e attivo
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();  //crei scope manuale, xk backgrounservice e singleton, e applicationdbcontext e scoped, quindi devi creare scope manuale per risolverlo

                var db = scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>(); //nuovo dbcontext per ogni ciclo, cosi eviti problemi di concorrenza

                var messages = await db.OutboxMessages
                    .Where(x => x.ProcessedOnUtc == null)
                    .Take(20)
                    .OrderBy(x => x.OccurredOnUtc)
                    .ToListAsync(ct);
                //lettura outbox, prendi i primi 20 messaggi non processati

                foreach (var msg in messages)
                {
                    var type = Type.GetType(msg.Type)!;  //!!xk devi salvare AssemblyQualifiedName del tipo, cosi puoi deserializzare correttamente l'evento di dominio, anche se hai piu eventi con lo stesso nome in assembly diversi. non .Name xk altrimenti in produzione fallira!

                    var domainEvent = JsonSerializer.Deserialize(msg.Payload, type);
                    //deserializzazione evento di dominio, cosi ricostruisci l'evento di dominio originale a partire dal payload JSON salvato nell'outbox

                    await _mediator.Publish((INotification)domainEvent!, ct);  //TROVA TUTTI GLI EVENTHANDLERS REGISTRATI PER QUELL'EVENTO, E LI ESEGUE.

                    msg.ProcessedOnUtc = DateTime.UtcNow;  //lo marchi (see OutboxMessage.cs)

                    _logger.LogDebug("Outbox message {MessageId} of type {MessageType} processed", msg.Id, msg.Type);
                }

                await db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                //Cattura esplicita: il background service non passa per la HTTP pipeline,
                //quindi Sentry non lo vedrebbe senza questa chiamata.
                SentrySdk.CaptureException(ex);
                _logger.LogError(ex, "Outbox processor encountered an error while processing messages");
            }
            await Task.Delay(2000, ct);  //!!POLLING OGNI 2 SEC
        }
    }


}
