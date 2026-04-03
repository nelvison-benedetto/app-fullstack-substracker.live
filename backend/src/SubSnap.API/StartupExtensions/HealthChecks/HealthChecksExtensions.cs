namespace SubSnap.API.StartupExtensions.HealthChecks;

//
/*
health checks: servono a dire al mondo esterno "la mia API è viva? funziona?"
endpoint GET /health rispondono 200 ok, oppure 500 app crash :(
utilissimi x per Docker,K8s,Load Balancer,Azure,AWS,ect.. zero coupling
*/
public static class HealthChecksExtensions
{
    public static IServiceCollection AddHealthChecksConfiguration(
        this IServiceCollection services)
    //registrazione DI (estendi il container DI)
    {
        services.AddHealthChecks();  //attivi il sistema health check di ASP.NET, ora cosi com'è controlla solo 'l'app è viva?', doesn't check db/redis/external apis
        /* e.g.
            .AddDbContextCheck<ApplicationDbContext>()
            .AddUrlGroup(new Uri("https://api.stripe.com"));
         */
        return services;
    }

    public static IApplicationBuilder UseHealthChecksConfiguration(
        this IApplicationBuilder app)  //IApplicationBuilder rapresents the http pipeline
    {
        app.UseHealthChecks("/health");  //create endpoint
        return app;
    }

}   
