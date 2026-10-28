using Microsoft.EntityFrameworkCore;
using SubSnap.Core.Domain.Entities;
using SubSnap.Infrastructure.Persistence.Outbox;

namespace SubSnap.Infrastructure.Persistence.Context;

//see applicationdbcontext.cs  servicecollectionextensions.cs  dependencyinjection.cs
/*
User (Aggregate Root)
 └── RefreshToken (child entity)

Subscription (Aggregate Root)
 └── SubscriptionHistory (child entity)

//un AGGREGATEROOT lo è SE puo essere modificato SENZA toccare il father (e.g.posso cancellare subscription senza toccare l'user!).
!il domain subscription NON deve conoscere domain User (NO uso di navigation properties!!)(vero DDD),
gli aggregate roots li linki nelle PK/FKshadow nelle loro xxxconfiguration.cs !
 */

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext( DbContextOptions<ApplicationDbContext> options )
        : base(options) { }  //passa le opzioni al costruttore della classe padre cioè DbContext

    //SOLO AGGREGATE ROOTS
    public DbSet<User> Users => Set<User>();  //=> Set<User>() è una expression-bodied property che sarebbe quindi public DbSet<User> Users{get{return Set<User>();}}, normalmente corrisponde ad 1 tua tabella sul db.
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<UserMedia> UserMedias => Set<UserMedia>();  //x upload avatar/media su Cloudflare R2
    public DbSet<Subscription> Subscriptions => Set<Subscription>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)  //portected = accessibile solo qua e hai children di questa classe, fai override di questo methodo (offerto da DbContext)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        //prende assembly corrente -> trova tutte le classi IEntityTypeConfiguration<T> -> le esegue. trova tutte le tue xxxConfiguration.
    }
    //scansiona l'assembly, e dici come mappare domain->db. altrimenti dovresti fare a mano modelBuilder.ApplyConfiguration(new UserConfiguration());...(anche per tutte le altri xxxConfiguration.cs)

}
