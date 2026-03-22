namespace SubSnap.API.Contracts.Media.Requests;

/// <summary>
/// Step 1: client chiede un presigned URL per caricare un file su R2.
/// </summary>
public record UploadUrlRequest(
    string FileName,
    string ContentType,
    string Folder = "avatars"   // avatars | posts | etc.
);
