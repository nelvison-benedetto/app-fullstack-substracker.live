using SubSnap.API.Middleware.Correlation;

namespace SubSnap.API.StartupExtensions.CorrelationId;

public static class CorrelationIdExtensions
{
    public static IApplicationBuilder UseCorrelationId(  //IApplicationBuilder rapresents the http pipeline
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<CorrelationIdMiddleware>();
        //now .net x each http req, execute also this ur custom middleware
    }
    
}