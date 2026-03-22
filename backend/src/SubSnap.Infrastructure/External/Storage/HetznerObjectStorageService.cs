// HetznerObjectStorageService — SOSTITUITO da CloudflareR2StorageService.
// Mantenuto solo come riferimento storico. NON implementa IObjectStorageService.
// see CloudflareR2StorageService.cs  IObjectStorageService.cs

namespace SubSnap.Infrastructure.External.Storage;

[Obsolete("Usa CloudflareR2StorageService. Storage migrato su Cloudflare R2 + CDN (cdn.substracker.live).")]
internal sealed class HetznerObjectStorageService
{
    // Precedentemente uploadava su Hetzner Object Storage (FSN1).
    // Flow rimpiazzato da presigned URL → browser PUT diretto su R2.
}