namespace SubSnap.API.StartupExtensions.Cors;

/*
set CORS (Cross-Origin Resource Sharing), 
 */

public static class CorsExtensions
{
    private const string CorsPolicyName = "DefaultCorsPolicy";

    public static IServiceCollection AddCorsConfiguration( this IServiceCollection services)  //x registrazione
    {
        services.AddCors(options =>   //activate system CORS of ASP.NET
        {

            //policy 1
            options.AddPolicy( CorsPolicyName, builder =>
            {
                builder
                    .AllowAnyOrigin()   //TODO ovviamente in prod non va bene AllowAnyOrigin, ma usi e.g..WithOrigins("https://app.subsnap.com") 
                    .AllowAnyMethod()   //allow any method get/post/put/delete/ect...
                    .AllowAnyHeader();  //allow any header Authorization/Content-Type/X-Correlation-Id/ect...
                //set rules
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
