using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Core.Domain.Entities;

public class Subscription
{
    public SubscriptionId Id { get; private set; }
    public UserId UserId { get; private set; }  //reference to User aggregate root by ID (DDD: aggr.roots si referenziano per Id, non per navigation property)
    public string Name { get; private set; }
    public decimal Amount { get; private set; }
    public string BillingCycle { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly? EndDate { get; private set; }
    public string? Category { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    protected Subscription() { }  //constructor x ORM only

    public Subscription(
        UserId userId,
        string name,
        decimal amount,
        string billingCycle,
        DateOnly startDate,
        DateOnly? endDate,
        string? category)
    {
        Id = SubscriptionId.New();
        UserId = userId;
        Name = name;
        Amount = amount;
        BillingCycle = billingCycle;
        StartDate = startDate;
        EndDate = endDate;
        Category = category;

        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string name, decimal amount, string billingCycle, string? category, DateOnly? endDate)
    {
        Name = name;
        Amount = amount;
        BillingCycle = billingCycle;
        Category = category;
        EndDate = endDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLastUpdateAt()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
