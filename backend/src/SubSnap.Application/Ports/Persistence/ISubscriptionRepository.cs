using SubSnap.Core.Domain.Aggregates;
using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.Ports.Persistence;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByIdAsync(SubscriptionId id, CancellationToken ct);
    Task<SubscriptionAggregate?> GetAggregateAsync(SubscriptionId id, CancellationToken ct);  //Subscription + SubscriptionHistories
    Task<IReadOnlyList<Subscription>> GetByUserIdAsync(UserId userId, CancellationToken ct);
    Task AddAsync(Subscription subscription, CancellationToken ct);
    Task UpdateAsync(Subscription subscription, CancellationToken ct);
    Task DeleteAsync(Subscription subscription, CancellationToken ct);
    Task DeleteHistoriesBySubscriptionIdAsync(SubscriptionId subscriptionId, CancellationToken ct);
    Task AddHistoryAsync(SubscriptionHistory history, SubscriptionId subscriptionId, CancellationToken ct);
}
