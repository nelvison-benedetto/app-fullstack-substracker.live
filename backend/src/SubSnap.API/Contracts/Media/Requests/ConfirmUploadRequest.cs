namespace SubSnap.API.Contracts.Media.Requests;

/*
Step 2: client conferma upload avvenuto su R2.
Il backend salva il record UserMedia nel DB.
*/
public record ConfirmUploadRequest(
    string FileKey,         //e.g. "avatars/uuid-photo.png"
    string ContentType,     //e.g. "image/png"
    long Size               //dimensione file in bytes
);
