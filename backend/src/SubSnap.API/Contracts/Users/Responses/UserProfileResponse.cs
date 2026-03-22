namespace SubSnap.API.Contracts.Users.Responses;

public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastLogin
);
