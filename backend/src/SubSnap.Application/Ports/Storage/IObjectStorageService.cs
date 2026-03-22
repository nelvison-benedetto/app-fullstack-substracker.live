namespace SubSnap.Application.Ports.Storage;

/*
 * x media(foto+video) dell'user, salvati su Cloudflare R2.
 * Flow presigned URL: client chiede URL → backend genera URL firmato → client fa PUT diretto su R2
 * see IObjectStorageService.cs CloudflareR2StorageService.cs UserMedia.cs MediaController.cs
 */

public record PresignedUploadResult(string UploadUrl, string FileKey, string PublicUrl);

public interface IObjectStorageService
{
    /// <summary>
    /// Genera un presigned URL per upload diretto browser→R2 (scade in 5 minuti).
    /// </summary>
    Task<PresignedUploadResult> GetPresignedUploadUrlAsync(
        string fileName,
        string contentType,
        string folder,
        CancellationToken ct);

    /// <summary>
    /// Upload server-side diretto su R2 (fallback / use case interni).
    /// </summary>
    Task<string> UploadAsync(
        Stream file,
        string fileName,
        string contentType,
        CancellationToken ct);

    Task DeleteAsync(string fileKey, CancellationToken ct);
}