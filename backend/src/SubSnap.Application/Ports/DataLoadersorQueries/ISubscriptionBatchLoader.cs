using SubSnap.Core.Domain.Entities;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Application.Ports.DataLoadersorQueries;

/*batch loader. cosi accumuli le queries READ, e poi fai 1 solo colpo.*/
public interface ISubscriptionBatchLoader
{
    Task<IReadOnlyList<Subscription>> Load(UserId userId,CancellationToken ct = default);

}
