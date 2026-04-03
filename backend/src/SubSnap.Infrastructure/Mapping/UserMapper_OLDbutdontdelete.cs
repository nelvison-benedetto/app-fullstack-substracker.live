//using SubSnap.Core.Domain.Entities;
//using SubSnap.Core.Domain.ValueObjects;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace SubSnap.Infrastructure.Mapping;

////cuore del ponte tra Domain e Persistence (.core/domain/entities <==> .infrastructure/persistence/scaffold (quelli che scarico dal db))
////Domain entities(core/domain/entitites/...), Persistence entitites(scaffold/...)

////NON TI SERVE PIU SE FAI DOMAIN-FIRST (cmnq dont delete!!)

//public static class UserMapper   //è static
//{
//    // DB -> Domain
//    public static Core.Domain.Entities.User ToDomain(Infrastructure.Persistence.Scaffold.User entity)
//        => new(  //fa un 'return new()'...
//            new UserId(entity.UserId),
//            new Email(entity.Email),
//            new PasswordHash(entity.PasswordHash),
//            entity.CreatedAt,
//            entity.UpdatedAt,
//            entity.LastLogin
//        );

//    // Domain -> DB
//    public static Infrastructure.Persistence.Scaffold.User ToEntity(Core.Domain.Entities.User domain)
//        => new()
//        {
//            //UserId = domain.Id?.Value ?? 0,  NON PASSIAMO NIENTE! XK lo genera il db
//            Email = domain.Email.Value,
//            PasswordHash = domain.PasswordHash.Value,
//            CreatedAt = domain.CreatedAt,
//            UpdatedAt = domain.UpdatedAt,
//            LastLogin = domain.LastLogin
//        };

//    //ok NON MAPPARE entity.SharedLink e entity.Subscription, quelle vivono negli Aggregates, non nel mapper base.
//}
