using SubSnap.Application.Ports.DataLoadersorQueries;
using SubSnap.Core.Domain.ValueObjects;
using SubSnap.Infrastructure.DataLoaders.Projections.Views;

namespace SubSnap.Infrastructure.DataLoaders.Projections;

//ogni xxxProjectionLoader.cs solitamente è solo x 1 solo caso d'uso. e.g.LoadDashboard() / LoadStats() / ect..
//here combinazione 2 Aggregate Roots!!
public class UserSubscriptionsProjectionLoader
{
    private readonly IUserAggregateLoader _userLoader;
    private readonly ISubscriptionBatchLoader _subscriptionLoader;

    public UserSubscriptionsProjectionLoader(
        IUserAggregateLoader userLoader,
        ISubscriptionBatchLoader subscriptionLoader)
    {
        _userLoader = userLoader;
        _subscriptionLoader = subscriptionLoader;
    }

    public async Task<UserSubscriptionsProjectionView?> LoadAsync(
        UserId userId,
        CancellationToken ct = default)
    {
        var userTask = _userLoader.LoadWithFullAsync(userId, ct);  //return type UserFullAggregate (custom only x i dati di return dell'aggregate)
        var subsTask = _subscriptionLoader.Load(userId, ct);

        await Task.WhenAll(userTask, subsTask);
        //esegue le 2 query in parallelo, aspettando che entrambe siano completate prima di procedere.

        var userAggregate = userTask.Result;

        if (userAggregate == null)
            return null;

        return new UserSubscriptionsProjectionView(
            userAggregate.User,
            subsTask.Result
        );
    }


}
