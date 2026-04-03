namespace SubSnap.API.Contracts.Media.Responses;

/*
step 2 response: URL CDN pubblico del file ora accessibile via cdn.substracker.live.
*/
public record ConfirmUploadResponse(
    string PublicUrl    // https://cdn.substracker.live/{FileKey}
);
