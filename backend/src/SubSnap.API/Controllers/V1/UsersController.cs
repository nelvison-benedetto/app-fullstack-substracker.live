using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubSnap.API.Contracts.Responses;
using SubSnap.API.Contracts.Users.Requests;
using SubSnap.API.Contracts.Users.Responses;
using SubSnap.Application.UseCases.Users.DeleteUser;
using SubSnap.Application.UseCases.Users.GetUserProfile;
using SubSnap.Application.UseCases.Users.RegisterUser;
using SubSnap.Application.UseCases.Users.UpdateUserProfile;
using SubSnap.Core.Domain.ValueObjects;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SubSnap.API.Controllers.V1;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly RUOrchestrator _ruOrchestrator;
    private readonly DeleteUserOrchestrator _deleteUserOrchestrator;
    private readonly GetUserProfileOrchestrator _getUserProfileOrchestrator;
    private readonly UpdateUserProfileOrchestrator _updateUserProfileOrchestrator;

    public UsersController(
        IMapper mapper,
        RUOrchestrator ruOrchestrator,
        DeleteUserOrchestrator deleteUserOrchestrator,
        GetUserProfileOrchestrator getUserProfileOrchestrator,
        UpdateUserProfileOrchestrator updateUserProfileOrchestrator)
    {
        _mapper = mapper;
        _ruOrchestrator = ruOrchestrator;
        _deleteUserOrchestrator = deleteUserOrchestrator;
        _getUserProfileOrchestrator = getUserProfileOrchestrator;
        _updateUserProfileOrchestrator = updateUserProfileOrchestrator;
    }

    private UserId GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userIdClaim is null) throw new UnauthorizedAccessException();
        return new UserId(Guid.Parse(userIdClaim));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResult<RegisterUserResponse>), StatusCodes.Status200OK)] //questi servono agli sviluppatori per capire / OpenAPI / Swagger x status code http x this method. SE INVECE USI IL RETURN Task<IActionResult> funziona sempre ma è meno leggibile da .net e da SwaggerApi
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    //[ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status500InternalServerError)] questo intanto è globale lo da auto via middleware
    public async Task<ActionResult<ApiResult<RegisterUserResponse>>> RegisterUserAsync([FromBody] RegisterUserRequest request, CancellationToken ct)
    {
        var command = _mapper.Map<RUCommand>(request);
        //await ValidatorHelper.ValidateCommandAsync(_validator, command); E' POCO CLEAN (il controller non dovrebbe conoscere la validation) ORA INVECE USO VALIDAZIONE AUTOMATICA w
        //PLUGIN MediatR (x validazione automatica, per non dover ogni volta esplicitare nel code) + plugin fluentvalidation. see more validationbehaviour.cs dependencyinjection.cs
        //var result = await _ruHandler.HandleAsync(command, ct);  OLD w IRUHandler
        //var result = await _mediator.Send(command, ct);  //x plugin MediatR
        var result = await _ruOrchestrator.Execute(command, ct);  //Controller → Orchestrator → MediatR pipelibe behviors → Handler

        var response = _mapper.Map<RegisterUserResponse>(result);  //see .api/mapping/resulttoresponseprofile.cs
        return Ok(ApiResult<RegisterUserResponse>.Ok(response));
        //qualsiasi cosa tu metta dentro Ok(...) verrà serializzata in JSON come body della risposta HTTP
    }

    //[HttpPost("register")]
    //[ProducesResponseType(typeof(ApiResult<UserResponse>), StatusCodes.Status200OK)] //questi servono agli sviluppatori per capire / OpenAPI / Swagger x status code http x this method.
    //[ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    //[ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status500InternalServerError)]
    //public async Task<ActionResult<ApiResult<UserResponse>>> Register( RegisterUserRequest request , CancellationToken ct)
    //{
    //    // Request -> Command mapping
    //    var command = _mapper.Map<RUCommand>(request);
    //    // Validazione centralizzata
    //    await ValidatorHelper.ValidateCommandAsync(_validator, command);
    //    // Application Layer
    //    var result = await _userService.RegisterAsync(command, ct);
    //    // Result -> Response
    //    var response = _mapper.Map<UserResponse>(result);  //see .api/mapping/resulttoresponseprofile.cs
    //    return Ok(ApiResult<UserResponse>.Ok(response));
    //    //qualsiasi cosa tu metta dentro Ok(...) verrà serializzata in JSON come body della risposta HTTP
    //    //ApiResult<T>.Ok(data)  my custom envelope standard per tutte le risposte
    //}
    /*
     Client -> HTTP Request -> DTO esterno (RegisterUserRequest)
      -> AutoMapper -> Command applicativo (RegisterUserCommand)
      -> Middleware valida Command (FluentValidation)
          -> Se fallisce: ApiResult.Fail 400
      -> Controller chiama Service
          -> Service orchestration
              -> Domain logic, Repositories
          -> Restituisce Result (UserResult)
      -> AutoMapper -> Response DTO (UserResponse)
      -> Envelope ApiResult.Ok
      -> JSON Response
     */

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteUserAsync(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _deleteUserOrchestrator.Execute(new DeleteUserCommand(userId), ct);
        return NoContent();
    }

    /// <summary>
    /// GET /api/v1/users/me
    /// Profilo dell'utente loggato.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResult<UserProfileResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResult<UserProfileResponse>>> GetProfileAsync(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var result = await _getUserProfileOrchestrator.Execute(new GetUserProfileQuery(userId), ct);
        var response = _mapper.Map<UserProfileResponse>(result);
        return Ok(ApiResult<UserProfileResponse>.Ok(response));
    }

    /// <summary>
    /// PUT /api/v1/users/me
    /// Aggiorna email e/o password dell'utente loggato.
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResult<UserProfileResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResult<UserProfileResponse>>> UpdateProfileAsync(
        [FromBody] UpdateUserProfileRequest request,
        CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var command = new UpdateUserProfileCommand(
            userId,
            request.NewEmail,
            request.CurrentPassword,
            request.NewPassword);

        var result = await _updateUserProfileOrchestrator.Execute(command, ct);
        var response = _mapper.Map<UserProfileResponse>(result);
        return Ok(ApiResult<UserProfileResponse>.Ok(response));
    }
}
