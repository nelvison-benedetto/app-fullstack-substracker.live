using MediatR;

namespace SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;

public sealed class UpdateSubOrchestrator
{
    private readonly IMediator _mediator;

    public UpdateSubOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<UpdateSubResult> Execute(UpdateSubCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
