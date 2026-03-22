using MediatR;

namespace SubSnap.Application.UseCases.Subscriptions.CreateSubscription;

public sealed class CreateSubOrchestrator
{
    private readonly IMediator _mediator;

    public CreateSubOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<CreateSubResult> Execute(CreateSubCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
