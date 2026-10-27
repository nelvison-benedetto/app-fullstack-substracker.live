using Amazon.S3;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SubSnap.Application.Ports.Auth;
using SubSnap.Application.Ports.DataLoadersorQueries;
using SubSnap.Application.Ports.Persistence;
using SubSnap.Application.Ports.Storage;
using SubSnap.Infrastructure.Background;
using SubSnap.Infrastructure.Caching;
using SubSnap.Infrastructure.DataLoaders.Aggregates;
using SubSnap.Infrastructure.DataLoaders.Batch;
using SubSnap.Infrastructure.External.Storage;
using SubSnap.Infrastructure.Identity.Services;
using SubSnap.Infrastructure.Persistence.Context;
using SubSnap.Infrastructure.Persistence.UnitOfWork;
using SubSnap.Infrastructure.Pipeline;
using SubSnap.Infrastructure.Repositories.Implementations;

namespace SubSnap.Infrastructure.DependencyInjection;

//see applicationdbcontext.cs  servicecollectionextensions.cs  dependencyinjection.cs

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(  // custom extension x IServiceCollection (la collezione di servizi della DI di ASP.NET Core)
        this IServiceCollection services, IConfiguration configuration)
    {
        //services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer( configuration.GetConnectionString("sqlConnection")));
        services.AddDbContext<ApplicationDbContext>( options => options.UseNpgsql( configuration.GetConnectionString("sqlConnection"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,                   // numero massimo di tentativi
                    maxRetryDelay: TimeSpan.FromSeconds(2), // ritardo massimo tra retry
                    errorCodesToAdd: null                // puoi aggiungere codici specifici se vuoi
                );
            }  //questi aiutano in production, se una query fallisce temporaneamente (e.g.per il db non è ancora pronto dopo il deploy) allora ritenta X volte, senza crashare al 1° tentativo.
            )
        );  //postgreSQL x EF core. SOLO WRITE(sempre usando UnitOfWork)

        services.AddDbContextFactory<ApplicationDbContext>(options =>   //factory, cosi crea nuove istanze di dbcontext quando viene chiesto esplicitamente e cosi puoi fare query parallele
            options.UseNpgsql(configuration.GetConnectionString("sqlConnection"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(2), null);
            }
            ),
            ServiceLifetime.Scoped); //AddDbContextFactory di default è singleton, ma tu lo vuoi scoped  
        //SOLO READ(cosi puoi fare QUERY PARALLELE!!)

        // services.AddHostedService<OutboxProcessor>(); // DISABILITATO — OutboxProcessor non attivo
        services.AddHttpContextAccessor();  //cosi subscriptionbatchloader.cs ha accesso al correlationid x logging(mex di debug)

        //registrazione dei repositories!!
        //quando qualcuno chiede IUserRepository, la DI darà un’istanza concreta di UserRepository
        services.AddScoped<IUserRepository, UserRepository>();          //!!!repositories (xk ricordati solo gli aggregate root hanno il proprio repository!!)
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();  //!!!repositories
        services.AddScoped<IUserMediaRepository, UserMediaRepository>();
        services.AddScoped<IUnitOfWork, EFUnitOfWork>();     //!!!unit of work
        services.AddScoped<IPasswordHasherService, AspNetPasswordHasherService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        //services.AddScoped<AuthHandlerOldService>(); //non serve interfaccia x utilizzarlo xk non attravera i BOUNDARIES, è un servizio che rimane interno a .Infrastructure, non lo chiama nessun altro prj.
        //Auth

        //services.AddScoped<ILoginHandler, LoginHandler>();
        //services.AddScoped<ILogoutHandler, LogoutHandler>();
        //services.AddScoped<IRTHandler, RTHandler>();
        //services.AddScoped<IRUHandler, RUHandler>();
        //User
        //services.AddScoped<IUserHandlerOldService, UserHandlerOldService>();     //OLD now all in .application/usecases

        //services.AddScoped< IRUHandler,RUHandler>();
        //non piu necessario IRUhandler perche ora usi RUCommand : IRequest<RUResult> e RUHandler : IRequestHandler<RUCommand, RUResult> usando plugin MediatR (mediatr diventa il dispatcher)

        //services.AddScoped<IEventDispatcher, MediatREventDispatcher>(); //ora uso outboxprocessor x dispatcher outbox pattern.

        //i LOADERS e BATCHERS sono usati da .application, quindi li registri in questo modo .application puo chiamare l'implementazione tramite l'interfaccia, e rispettare i boudaries.
        services.AddScoped<QueryCache>();
        services.AddScoped<IUserAggregateLoader, UserAggregateLoader>();
        services.AddScoped<ISubscriptionAggregateLoader, SubscriptionAggregateLoader>();
        //addscoped bc 1 http req = 1 batch window
        services.AddScoped<ISubscriptionBatchLoader, SubscriptionBatchLoader>();
        //quindi quando vorrai usare e.g.sharedlinkbatchloader.cs, allora dovrai registrare here interface-implementazione.

        //!!LE PROJECTIONS vengono usate solo all'interno di .infrastructure (spesso da un handler interno a .infrastructure), quindi NON crei l'interfaccia. se ne hai bisogno nel DI le registri cosi services.AddScoped<UserSubscriptionsProjectionLoader>();  

        //services.AddScoped<ISharedLinkBatchLoader, SharedLinkBatchLoader>();
        //TODO missing the others?

        // Cloudflare R2 — compatibile S3 API (ForcePathStyle obbligatorio x R2)
        // ServiceURL: https://{AccountId}.r2.cloudflarestorage.com
        // CDN pubblico: https://cdn.substracker.live/{fileKey}
        // see CloudflareR2StorageService.cs  MediaController.cs  IObjectStorageService.cs
        services.AddSingleton<IAmazonS3>(sp => //il client S3 viene creato 1 volta sola per tutta la vita dell'app (singleton), lo setto cosi xk è solo un http client configurato, non ha stato legato alla richiesta.
        {
            var accountId = configuration["CloudflareR2:AccountId"]!;
            var r2Config = new AmazonS3Config
            {
                ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                //endpoint x R2 (di cloudflare, x imgs), è nel tuo account cloudflare
                ForcePathStyle = true
                //R2 richiede ForcePathStyle=true perché usa URL stile path invece di subdomain. Invece di bucketname.s3.amazonaws.com/bucketname, è s3.amazonaws.com/bucketname. Se non lo metti, il client S3 cercherà di accedere a bucketname.s3.amazonaws.com che non esiste in R2, e avrai errori 404 o simili.
            };
            return new AmazonS3Client(  //crea il client S3 usando le credenziali e la configurazione specifica per R2
                configuration["CloudflareR2:AccessKey"],
                configuration["CloudflareR2:SecretKey"],
                r2Config);
        });
        services.AddScoped<IObjectStorageService, CloudflareR2StorageService>();
        //astrazione,xk .application non deve conoscere R2 (cioe l'implementazione), ma solo l'interfaccia.

        // Sentry tracing behavior — innermost MediatR wrapper.
        // Ogni command/query diventa uno span figlio della HTTP transaction su Sentry.
        // see SentryTracingBehavior.cs
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(SentryTracingBehavior<,>));

        return services;

        //scoped: una nuova istanza per ogni richiesta HTTP, condivisa all’interno della stessa richiesta. Perfetto x DbContext e servizi che lavorano con esso.
        //!!!in questo modo quando chiami l'interfaccia, utilizzi invece la classe concrete. ottimo xk rispetti i BOUNDARIES(confini) tra prj, un proj non conosce le implementazioni dell'altro, ma SOLO LE INTERFACCIE. e poi xk ti permette di fare facilmente il mock dei servizi nelle unit test!!
    }

}