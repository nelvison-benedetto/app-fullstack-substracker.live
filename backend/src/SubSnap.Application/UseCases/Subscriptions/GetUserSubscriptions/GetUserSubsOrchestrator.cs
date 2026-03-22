using MediatR;

namespace SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;

public sealed class GetUserSubsOrchestrator
{
    private readonly IMediator _mediator;

    public GetUserSubsOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<List<GetUserSubsResult>> Execute(GetUserSubsCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
