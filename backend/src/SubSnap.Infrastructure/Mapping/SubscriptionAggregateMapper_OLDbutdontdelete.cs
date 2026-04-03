//using SubSnap.Core.Domain.Aggregates;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace SubSnap.Infrastructure.Mapping;

//public static class SubscriptionAggregateMapper
//{
//    public static SubscriptionAggregate ToDomain(Infrastructure.Persistence.Scaffold.Subscription entity)
//    {
//        return new SubscriptionAggregate(
//            SubscriptionMapper.ToDomain(entity),
//            entity.SubscriptionHistory.Select(SubscriptionHistoryMapper.ToDomain)
//        );
//    }
//}
