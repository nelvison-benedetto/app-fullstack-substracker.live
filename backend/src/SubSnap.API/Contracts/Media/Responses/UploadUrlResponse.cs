namespace SubSnap.API.Contracts.Media.Responses;

/// <summary>
/// Step 1 response: il client usa UploadUrl per fare PUT diretto su R2,
/// poi manda FileKey a /confirm-upload.
/// </summary>
public record UploadUrlResponse(
    string UploadUrl,   // presigned URL (scade in 5 min) — client fa PUT qui
    string FileKey,     // es. "avatars/uuid-photo.png" — da mandare a confirm-upload
    string PublicUrl    // URL CDN finale: https://cdn.substracker.live/{FileKey}
);
