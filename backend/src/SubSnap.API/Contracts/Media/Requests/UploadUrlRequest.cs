namespace SubSnap.API.Contracts.Media.Requests;

//Step 1: client chiede un presigned URL per caricare un file su R2.
public record UploadUrlRequest(
    string FileName,
    string ContentType,
    string Folder = "avatars"   //avatars | posts | etc.
);
