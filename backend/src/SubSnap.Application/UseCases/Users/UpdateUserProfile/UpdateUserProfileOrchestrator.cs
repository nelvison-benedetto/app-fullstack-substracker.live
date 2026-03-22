using MediatR;

namespace SubSnap.Application.UseCases.Users.UpdateUserProfile;

public sealed class UpdateUserProfileOrchestrator
{
    private readonly IMediator _mediator;

    public UpdateUserProfileOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<UpdateUserProfileResult> Execute(UpdateUserProfileCommand cmd, CancellationToken ct = default)
        => _mediator.Send(cmd, ct);
}
