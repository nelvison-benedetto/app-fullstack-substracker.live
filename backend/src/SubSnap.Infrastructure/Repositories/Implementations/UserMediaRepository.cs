using Microsoft.EntityFrameworkCore;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;
using SubSnap.Infrastructure.Persistence.Context;

namespace SubSnap.Infrastructure.Repositories.Implementations;

/// <summary>
/// Repository per UserMedia: salva i record dei file caricati su Cloudflare R2.
/// see IUserMediaRepository.cs UserMediaRepository.cs MediaController.cs
/// </summary>
public class UserMediaRepository : IUserMediaRepository
{
    private readonly ApplicationDbContext _context;

    public UserMediaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(UserMedia media, CancellationToken ct)
    {
        await _context.UserMedias.AddAsync(media, ct);
    }

    public async Task<IReadOnlyList<UserMedia>> GetByUserIdAsync(UserId userId, CancellationToken ct)
    {
        return await _context.UserMedias
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.UploatedAt)
            .ToListAsync(ct);
    }
}
