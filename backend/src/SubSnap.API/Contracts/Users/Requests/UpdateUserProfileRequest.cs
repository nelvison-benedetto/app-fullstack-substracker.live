namespace SubSnap.API.Contracts.Users.Requests;

public sealed record UpdateUserProfileRequest(
    string? NewEmail,
    string? CurrentPassword,
    string? NewPassword
);
