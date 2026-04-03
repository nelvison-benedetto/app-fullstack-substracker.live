//using SubSnap.Core.Domain.ValueObjects;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace SubSnap.Infrastructure.Mapping;


//public static class SubscriptionHistoryMapper
//{
//    // DB -> Domain
//    public static Core.Domain.Entities.SubscriptionHistory ToDomain(Infrastructure.Persistence.Scaffold.SubscriptionHistory entity)
//        => new(
//            entity.Action,
//            entity.OldValue,
//            entity.NewValue,
//            entity.CreatedAt
//        );
//}