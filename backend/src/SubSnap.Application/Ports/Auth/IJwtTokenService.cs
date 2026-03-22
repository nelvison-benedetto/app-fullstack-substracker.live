using SubSnap.Core.Domain.Entities;

namespace SubSnap.Application.Ports.Auth;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    DateTime GetRefreshTokenExpiry();  //DateTime.UtcNow + RefreshTokenExpiryDays da config (JwtSettings:RefreshTokenExpiryDays)
}
