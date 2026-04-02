using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Sentry;
using SubSnap.Application.Ports.Storage;

namespace SubSnap.Infrastructure.External.Storage;

/*
 * Cloudflare R2 storage con CDN globale (cdn.substracker.live).
 * Flow principale: presigned URL → browser fa PUT diretto su R2 → backend salva URL nel DB.
 * see IObjectStorageService.cs CloudflareR2StorageService.cs UserMedia.cs MediaController.cs
 */

public class CloudflareR2StorageService : IObjectStorageService
{
    private readonly IAmazonS3 _s3;  //client S3-compatible (Cloudflare R2 usa API S3)
    private readonly string _bucketName;
    private readonly string _cdnBaseUrl;  //public domain e.g.https://cdn.substracker.live
    private readonly IHub _sentryHub;

    public CloudflareR2StorageService(IAmazonS3 s3, IConfiguration configuration, IHub sentryHub)
    {
        _s3 = s3;
        _bucketName = configuration["CloudflareR2:BucketName"]!;
        _cdnBaseUrl = configuration["CloudflareR2:CdnBaseUrl"]!; // https://cdn.substracker.live
        _sentryHub = sentryHub;
    }

    /// <summary>
    /// Genera presigned URL per upload diretto browser→R2.
    /// Scade in 5 minuti. Solo immagini consentite.
    /// Struttura fileKey: {folder}/{guid}-{fileName}  →  es. avatars/uuid-photo.png
    /// URL pubblico finale: https://cdn.substracker.live/{fileKey}
    /// </summary>
    public Task<PresignedUploadResult> GetPresignedUploadUrlAsync(
        string fileName,
        string contentType,
        string folder,
        CancellationToken ct)
    {
        if (!contentType.StartsWith("image/"))
            throw new ArgumentException("Solo file immagine consentiti.", nameof(contentType));

        var fileKey = $"{folder}/{Guid.NewGuid()}-{fileName}";

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(5),
            ContentType = contentType
        };

        var uploadUrl = _s3.GetPreSignedURL(request);
        var publicUrl = $"{_cdnBaseUrl}/{fileKey}";

        return Task.FromResult(new PresignedUploadResult(uploadUrl, fileKey, publicUrl));
    }

    /// <summary>
    /// Upload server-side diretto su R2 (per use case interni, non il flow principale).
    /// Restituisce l'URL CDN pubblico del file caricato.
    /// </summary>
    public async Task<string> UploadAsync(
        Stream file,
        string fileName,
        string contentType,
        CancellationToken ct)
    {
        var fileKey = $"uploads/{Guid.NewGuid()}-{fileName}";
        var span = _sentryHub.GetSpan()?.StartChild("r2.upload", $"PUT {_bucketName}/{fileKey}");

        try
        {
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileKey,
                InputStream = file,
                ContentType = contentType
            };

            await _s3.PutObjectAsync(request, ct);

            span?.Finish(SpanStatus.Ok);
            return $"{_cdnBaseUrl}/{fileKey}";
        }
        catch (Exception ex)
        {
            span?.Finish(ex);
            throw;
        }
    }

    public async Task DeleteAsync(string fileKey, CancellationToken ct)
    {
        var span = _sentryHub.GetSpan()?.StartChild("r2.delete", $"DELETE {_bucketName}/{fileKey}");

        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileKey
            };

            await _s3.DeleteObjectAsync(request, ct);
            span?.Finish(SpanStatus.Ok);
        }
        catch (Exception ex)
        {
            span?.Finish(ex);
            throw;
        }
    }
}
