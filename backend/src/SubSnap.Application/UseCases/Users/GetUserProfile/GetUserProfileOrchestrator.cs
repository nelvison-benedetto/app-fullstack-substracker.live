using MediatR;

namespace SubSnap.Application.UseCases.Users.GetUserProfile;

public sealed class GetUserProfileOrchestrator
{
    private readonly IMediator _mediator;

    public GetUserProfileOrchestrator(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task<GetUserProfileResult> Execute(GetUserProfileQuery query, CancellationToken ct = default)
        => _mediator.Send(query, ct);
}
