namespace SubSnap.API.Contracts.Media.Requests;

/// <summary>
/// Step 2: client conferma upload avvenuto su R2.
/// Il backend salva il record UserMedia nel DB.
/// </summary>
public record ConfirmUploadRequest(
    string FileKey,         // es. "avatars/uuid-photo.png"
    string ContentType,     // es. "image/png"
    long Size               // dimensione file in bytes
);
