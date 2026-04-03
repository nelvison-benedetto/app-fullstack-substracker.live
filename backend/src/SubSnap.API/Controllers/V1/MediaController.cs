using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubSnap.API.Contracts.Errors;
using SubSnap.API.Contracts.Media.Requests;
using SubSnap.API.Contracts.Media.Responses;
using SubSnap.API.Contracts.Responses;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.Ports.Storage;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SubSnap.API.Controllers.V1;

/*
 flow Cloudflare R2 + CDN:
 1. POST /api/v1/media/upload-url  -> backend genera presigned URL (scade 5 min)
 2. Browser → PUT diretto su R2 usando il presigned URL
 3. POST /api/v1/media/confirm-upload -> backend salva record UserMedia nel DB
 
 URL finale pubblico: https://cdn.substracker.live/{fileKey}
 see IObjectStorageService.cs CloudflareR2StorageService.cs UserMedia.cs
 */

[ApiController]
[Route("api/v1/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IObjectStorageService _storage;
    private readonly IUserMediaRepository _userMediaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MediaController(
        IObjectStorageService storage,
        IUserMediaRepository userMediaRepository,
        IUnitOfWork unitOfWork)
    {
        _storage = storage;
        _userMediaRepository = userMediaRepository;
        _unitOfWork = unitOfWork;
    }

    private UserId GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)  //TODO info
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userIdClaim is null) throw new UnauthorizedAccessException();
        return new UserId(Guid.Parse(userIdClaim));
    }

    /*
    Step 1 — Genera presigned URL per upload diretto browser→R2.
    Max 5MB, solo immagini.
    */
    [HttpPost("upload-url")]
    [ProducesResponseType(typeof(ApiResult<UploadUrlResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResult<UploadUrlResponse>>> GetUploadUrlAsync(
        [FromBody] UploadUrlRequest request,
        CancellationToken ct)
    {
        if (!request.ContentType.StartsWith("image/"))
            return BadRequest(ApiResult<object>.Fail(new ApiError(400, "Solo file immagine consentiti.")));

        var result = await _storage.GetPresignedUploadUrlAsync(
            request.FileName,
            request.ContentType,
            request.Folder,
            ct);

        var response = new UploadUrlResponse(result.UploadUrl, result.FileKey, result.PublicUrl);
        return Ok(ApiResult<UploadUrlResponse>.Ok(response));
    }

    /*
    Step 2 — Conferma upload completato: salva record UserMedia nel DB.
    Chiamato DOPO che il browser ha fatto PUT diretto su R2.
    */
    [HttpPost("confirm-upload")]
    [ProducesResponseType(typeof(ApiResult<ConfirmUploadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResult<ConfirmUploadResponse>>> ConfirmUploadAsync(
        [FromBody] ConfirmUploadRequest request,
        CancellationToken ct)
    {
        if (request.Size > 5_000_000)
            return BadRequest(ApiResult<object>.Fail(new ApiError(400, "File troppo grande. Massimo 5MB.")));

        var userId = GetCurrentUserId();
        var publicUrl = $"https://cdn.substracker.live/{request.FileKey}";

        var media = new UserMedia(
            userId,
            request.FileKey,
            request.ContentType,
            request.Size);

        await _userMediaRepository.AddAsync(media, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Ok(ApiResult<ConfirmUploadResponse>.Ok(new ConfirmUploadResponse(publicUrl)));
    }

    /*
    GET tutti i media dell'utente corrente.
    */
    [HttpGet]
    [ProducesResponseType(typeof(ApiResult<IReadOnlyList<string>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResult<IReadOnlyList<string>>>> GetMyMediaAsync(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var medias = await _userMediaRepository.GetByUserIdAsync(userId, ct);
        var urls = medias.Select(m => $"https://cdn.substracker.live/{m.ObjectKey}").ToList();
        return Ok(ApiResult<IReadOnlyList<string>>.Ok(urls));
    }
}
