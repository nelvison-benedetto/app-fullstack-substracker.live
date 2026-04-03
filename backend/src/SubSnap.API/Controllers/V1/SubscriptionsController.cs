using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubSnap.API.Contracts.Responses;
using SubSnap.API.Contracts.Subscriptions.Requests;
using SubSnap.API.Contracts.Subscriptions.Responses;
using SubSnap.Application.UseCases.Subscriptions.CreateSubscription;
using SubSnap.Application.UseCases.Subscriptions.DeleteSubscription;
using SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;
using SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;
using SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;
using SubSnap.Core.Domain.ValueObjects;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SubSnap.API.Controllers.V1;

[ApiController]
[Route("api/v1/subscriptions")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly GetUserSubsOrchestrator _getUserSubsOrchestrator;
    private readonly CreateSubOrchestrator _createSubOrchestrator;
    private readonly UpdateSubOrchestrator _updateSubOrchestrator;
    private readonly DeleteSubOrchestrator _deleteSubOrchestrator;
    private readonly GetSubDetailOrchestrator _getSubDetailOrchestrator;

    public SubscriptionsController(
        IMapper mapper,
        GetUserSubsOrchestrator getUserSubsOrchestrator,
        CreateSubOrchestrator createSubOrchestrator,
        UpdateSubOrchestrator updateSubOrchestrator,
        DeleteSubOrchestrator deleteSubOrchestrator,
        GetSubDetailOrchestrator getSubDetailOrchestrator)
    {
        _mapper = mapper;
        _getUserSubsOrchestrator = getUserSubsOrchestrator;
        _createSubOrchestrator = createSubOrchestrator;
        _updateSubOrchestrator = updateSubOrchestrator;
        _deleteSubOrchestrator = deleteSubOrchestrator;
        _getSubDetailOrchestrator = getSubDetailOrchestrator;
    }

    private UserId GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userIdClaim is null) throw new UnauthorizedAccessException();
        return new UserId(Guid.Parse(userIdClaim));
    }

    /*
    GET /api/v1/subscriptions
    Tutte le subscriptions dell'utente loggato.
    Query ottimizzata: BatchLoader → 1 sola SELECT WHERE userid = @id
    */
    [HttpGet]
    [ProducesResponseType(typeof(ApiResult<List<SubscriptionResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResult<List<SubscriptionResponse>>>> GetSubscriptionsAsync(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var results = await _getUserSubsOrchestrator.Execute(new GetUserSubsCommand(userId), ct);
        var response = results.Select(r => _mapper.Map<SubscriptionResponse>(r)).ToList();
        return Ok(ApiResult<List<SubscriptionResponse>>.Ok(response));
    }

    /*
    GET /api/v1/subscriptions/{id}
    Singola subscription + storico modifiche.
    Query ottimizzata: SubscriptionAggregateLoader → 2 query parallele via Task.WhenAll + QueryCache
    */
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResult<SubscriptionDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResult<SubscriptionDetailResponse>>> GetSubscriptionDetailAsync(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _getSubDetailOrchestrator.Execute(
            new GetSubDetailCommand(new SubscriptionId(id), userId), ct);
        var response = _mapper.Map<SubscriptionDetailResponse>(result);
        return Ok(ApiResult<SubscriptionDetailResponse>.Ok(response));
    }

    /*
    POST /api/v1/subscriptions
    Crea una nuova subscription per l'utente loggato.
    */
    [HttpPost]
    [ProducesResponseType(typeof(ApiResult<SubscriptionResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResult<SubscriptionResponse>>> CreateSubscriptionAsync(
        [FromBody] CreateSubscriptionRequest request,
        CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var command = new CreateSubCommand(
            userId,
            request.Name,
            request.Amount,
            request.BillingCycle,
            request.StartDate,
            request.EndDate,
            request.Category);

        var result = await _createSubOrchestrator.Execute(command, ct);
        var response = _mapper.Map<SubscriptionResponse>(result);
        return Created($"/api/v1/subscriptions/{result.Id}", ApiResult<SubscriptionResponse>.Ok(response));
    }

    /*
    PUT /api/v1/subscriptions/{id}
    Aggiorna una subscription dell'utente loggato.
    */
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResult<SubscriptionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResult<SubscriptionResponse>>> UpdateSubscriptionAsync(
        Guid id,
        [FromBody] UpdateSubscriptionRequest request,
        CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var command = new UpdateSubCommand(
            new SubscriptionId(id),
            userId,
            request.Name,
            request.Amount,
            request.BillingCycle,
            request.EndDate,
            request.Category);

        var result = await _updateSubOrchestrator.Execute(command, ct);
        var response = _mapper.Map<SubscriptionResponse>(result);
        return Ok(ApiResult<SubscriptionResponse>.Ok(response));
    }

    /*
    DELETE /api/v1/subscriptions/{id}
    Elimina una subscription dell'utente loggato.
    */
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubscriptionAsync(Guid id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _deleteSubOrchestrator.Execute(
            new DeleteSubCommand(new SubscriptionId(id), userId), ct);
        return NoContent();
    }

}
