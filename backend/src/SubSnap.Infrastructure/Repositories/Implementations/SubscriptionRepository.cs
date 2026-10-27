using Microsoft.EntityFrameworkCore;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Core.Domain.Aggregates;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;
using SubSnap.Infrastructure.Persistence.Context;

namespace SubSnap.Infrastructure.Repositories.Implementations;

//repository = composizione query
//here NO savechangesasync!!, because it's done in unit of work!!

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext _context;

    public SubscriptionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByIdAsync(SubscriptionId id, CancellationToken ct)
    {
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<SubscriptionAggregate?> GetAggregateAsync(SubscriptionId id, CancellationToken ct)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (subscription is null) return null;

        var history = await _context.Set<SubscriptionHistory>()
            .Where(h => EF.Property<SubscriptionId>(h, "SubscriptionId") == id)
            .OrderBy(h => h.CreatedAt)
            .ToListAsync(ct);

        return new SubscriptionAggregate(subscription, history);
    }

    public async Task<IReadOnlyList<Subscription>> GetByUserIdAsync(UserId userId, CancellationToken ct)
    {
        return await _context.Subscriptions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
    }

    public Task AddAsync(Subscription subscription, CancellationToken ct)
    {
        _context.Subscriptions.Add(subscription);
        return Task.CompletedTask;
        //savechangesasync sara fatto in transactionbehavior.cs durante la risalita verso il controller
    }

    public Task UpdateAsync(Subscription subscription, CancellationToken ct)
    {
        _context.Subscriptions.Update(subscription);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Subscription subscription, CancellationToken ct)
    {
        _context.Subscriptions.Remove(subscription);
        return Task.CompletedTask;
    }

    public async Task DeleteHistoriesBySubscriptionIdAsync(SubscriptionId subscriptionId, CancellationToken ct)
    {
        var histories = await _context.Set<SubscriptionHistory>()
            .Where(h => EF.Property<SubscriptionId>(h, "SubscriptionId") == subscriptionId)
            .ToListAsync(ct);

        if (histories.Count > 0)
            _context.Set<SubscriptionHistory>().RemoveRange(histories);
    }

    public Task AddHistoryAsync(SubscriptionHistory history, SubscriptionId subscriptionId, CancellationToken ct)
    {
        var entry = _context.Set<SubscriptionHistory>().Add(history);
        entry.Property("SubscriptionId").CurrentValue = subscriptionId;  //imposta la shadow FK
        return Task.CompletedTask;
    }

}
