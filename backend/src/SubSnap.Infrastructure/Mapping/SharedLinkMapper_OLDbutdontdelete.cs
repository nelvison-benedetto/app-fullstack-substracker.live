//using SubSnap.Core.Domain.ValueObjects;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace SubSnap.Infrastructure.Mapping;

//public static class SharedLinkMapper
//{
//    // DB -> Domain
//    public static Core.Domain.Entities.SharedLink ToDomain(Infrastructure.Persistence.Scaffold.SharedLink entity)
//        => new(
//            new(entity.SharedLinkId),
//            entity.Link,
//            entity.ExpireAt,
//            entity.Views
//        );

//    // Domain -> DB
//    public static Infrastructure.Persistence.Scaffold.SharedLink ToEntity(Core.Domain.Entities.SharedLink domain, int userId)
//        => new()
//        {
//            SharedLinkId = domain.Id.Value,
//            UserId = userId,
//            Link = domain.Link,
//            ExpireAt = domain.ExpireAt,
//            Views = domain.Views
//        };
//}