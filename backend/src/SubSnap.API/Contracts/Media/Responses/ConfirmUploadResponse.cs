namespace SubSnap.API.Contracts.Media.Responses;

/// <summary>
/// Step 2 response: URL CDN pubblico del file ora accessibile via cdn.substracker.live.
/// </summary>
public record ConfirmUploadResponse(
    string PublicUrl    // https://cdn.substracker.live/{FileKey}
);
