using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SubSnap.Application.Ports.Auth;
using SubSnap.Core.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SubSnap.Infrastructure.Identity.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;
    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!.Value.ToString()),  //! perche deve esistere
            new Claim(ClaimTypes.NameIdentifier, user.Id!.Value.ToString()), //cosi aspnet sa sempre chi e l'utente
            new Claim(JwtRegisteredClaimNames.Email, user.Email.Value)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));

        var expiryMinutes = int.TryParse(_config["JwtSettings:AccessTokenExpiryMinutes"], out var m) ? m : 10;

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    //usa CSPRNG (crypto-secure), praticamente impossibile da indovinare

    public DateTime GetRefreshTokenExpiry()
    {
        var days = int.TryParse(_config["JwtSettings:RefreshTokenExpiryDays"], out var d) ? d : 30;
        return DateTime.UtcNow.AddDays(days);
    }
}
