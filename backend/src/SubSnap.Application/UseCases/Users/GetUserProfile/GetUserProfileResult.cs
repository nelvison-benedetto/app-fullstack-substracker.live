namespace SubSnap.Application.UseCases.Users.GetUserProfile;

public sealed record GetUserProfileResult(
    Guid Id,
    string Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastLogin
);
