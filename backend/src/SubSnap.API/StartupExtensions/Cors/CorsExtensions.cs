namespace SubSnap.API.StartupExtensions.Cors;

/*
set CORS (Cross-Origin Resource Sharing),
 */

public static class CorsExtensions
{
    private const string CorsPolicyName = "DefaultCorsPolicy";

    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, builder =>
            {
                builder
                    .WithOrigins(allowedOrigins)  // origini esplicite da appsettings (per env)
                    .AllowAnyMethod()             // allow any method get/post/put/delete/ect...
                    .AllowAnyHeader();            // allow any header Authorization/Content-Type/X-Correlation-Id/ect...
            });
        });

        return services;
    }

    public static IApplicationBuilder UseCorsConfiguration( this IApplicationBuilder app )  //IApplicationBuilder rapresents the http pipeline
    {
        app.UseCors(CorsPolicyName);
        return app;
    }
    
}
