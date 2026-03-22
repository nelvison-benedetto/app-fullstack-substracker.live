using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.Ports.Persistence;

/// <summary>
/// Repository per UserMedia (record dei file caricati su Cloudflare R2).
/// see IUserMediaRepository.cs UserMediaRepository.cs MediaController.cs
/// </summary>
public interface IUserMediaRepository
{
    Task AddAsync(UserMedia media, CancellationToken ct);
    Task<IReadOnlyList<UserMedia>> GetByUserIdAsync(UserId userId, CancellationToken ct);
}
