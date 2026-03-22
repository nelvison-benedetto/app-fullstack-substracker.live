using MediatR;

namespace SubSnap.Application.UseCases.Subscriptions.DeleteSubscription;

public sealed class DeleteSubOrchestrator
{
    private readonly IMediator _mediator;

    public DeleteSubOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task Execute(DeleteSubCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
