using MediatR;

namespace SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;

public sealed class GetSubDetailOrchestrator
{
    private readonly IMediator _mediator;

    public GetSubDetailOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<GetSubDetailResult> Execute(GetSubDetailCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
