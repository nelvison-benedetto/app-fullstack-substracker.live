namespace SubSnap.Application.UseCases.Users.UpdateUserProfile;

public sealed record UpdateUserProfileResult(
    Guid Id,
    string Email,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastLogin
);
