using MediatR;
using Sentry;

namespace SubSnap.Infrastructure.Pipeline;

/*
Crea uno span Sentry figlio per ogni MediatR command/query.
Lo span appare DENTRO la HTTP transaction su Sentry Performance:
Transaction: POST /api/v1/subscriptions  (200ms)
    └─ mediatR: CreateSubCommand           (150ms)   ← questo span
         └─ r2.upload: PUT assets/...      (40ms)    ← span figlio di R2
Registrato come ULTIMO behavior (innermost): misura il tempo del vero Handler
senza overhead di validation/logging (che sono <1ms comunque).

see ServiceCollectionExtensions.cs  CloudflareR2StorageService.cs  Program.cs
*/
public sealed class SentryTracingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IHub _sentryHub;

    public SentryTracingBehavior(IHub sentryHub)
    {
        _sentryHub = sentryHub;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var requestName = typeof(TRequest).Name;

        // GetSpan() ritorna la transaction HTTP corrente (creata da UseSentryTracing()).
        // StartChild() crea uno span figlio → appare come riga nella timeline su Sentry.
        // Se non c'è nessuna transaction attiva (es. background job), GetSpan() ritorna null
        // e l'operazione viene saltata silenziosamente.
        var span = _sentryHub.GetSpan()?.StartChild("mediatR", requestName);

        try
        {
            var response = await next();
            span?.Finish(SpanStatus.Ok);
            return response;
        }
        catch (Exception ex)
        {
            span?.Finish(ex);  // marca lo span come fallito + allega l'eccezione
            throw;
        }
    }
}
