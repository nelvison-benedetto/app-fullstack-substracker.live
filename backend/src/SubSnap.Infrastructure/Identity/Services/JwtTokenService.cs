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
        var claims = new[]  //claim è un'informazione associata all'identità dell'utente
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!.Value.ToString()),  //e.g."sub": "8f3c7d8a-1234-4567-9876-123456789abc" , ! perche deve esistere
            new Claim(ClaimTypes.NameIdentifier, user.Id!.Value.ToString()), //ClaimTypes.NameIdentifier è una costante .NET per il claim che rappresenta l'identificativo dell'utente, cosi aspnet sa sempre chi e l'utente (e.g. nel controller puoi fare User.FindFirst(ClaimTypes.NameIdentifier)?.Value)
            new Claim(JwtRegisteredClaimNames.Email, user.Email.Value)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));  //converte str -> array di bit

        var expiryMinutes = int.TryParse(_config["JwtSettings:AccessTokenExpiryMinutes"], out var m) ? m : 10;  //converte str -> intero

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],  //chi ha emesso il token
            audience: _config["JwtSettings:Audience"],  //audience target a chi è destinato
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)  //credenziali crittografiche come firmare il token
        );
        return new JwtSecurityTokenHandler().WriteToken(token);  //formato compatto header+payload+signature
    }

    public string GenerateRefreshToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));  //RandomNumberGenerator è assolutamente da usare invece di semplice Random() x la generazione sicura di valori crittografici
    //usa CSPRNG (crypto-secure), praticamente impossibile da indovinare. genera stringa casuale (non token) che viene utilizzata come Refresh Token (cosi utente non deve rifare ri-login)

    public DateTime GetRefreshTokenExpiry()
    {
        var days = int.TryParse(_config["JwtSettings:RefreshTokenExpiryDays"], out var d) ? d : 30;
        return DateTime.UtcNow.AddDays(days);
    }


}
