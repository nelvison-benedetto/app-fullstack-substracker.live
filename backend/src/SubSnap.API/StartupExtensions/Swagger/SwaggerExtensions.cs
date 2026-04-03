using Microsoft.OpenApi;

namespace SubSnap.API.StartupExtensions.Swagger;

/*
create file metadata that contains info about endpoint/request/response/model shema, exposes the file to an endpoint url: THIS IS THE STANDART OpenApi !
 */

public static class SwaggerExtensions  //x documentazione, no logica
{

    public static IServiceCollection AddSwaggerConfiguration( this IServiceCollection services)
    //registrazione DI (estendi il container DI)
    {
        services.AddEndpointsApiExplorer();
        //.net automatically analyze controller/endpoint/route/params, build a 'model' of the api. without this Swagger can't know what enpoint exixts/which params they have
        services.AddSwaggerGen(options =>  //activate generator Swagger
        {
            options.SwaggerDoc("v1", new OpenApiInfo  //'v1' is name of the doc, OpenApiInfo are info rendered in the UI Swagger
            {
                Title = "SubSnap API",
                Version = "v1",
                Description = "Subscription management API"
            });
            //create file /swagger/v1/swagger.json that describes all your api
        });
        return services;
    }

    public static IApplicationBuilder UseSwaggerConfiguration( this IApplicationBuilder app )  //IApplicationBuilder rapresents the http pipeline
    {
        app.UseSwagger();  //exposes endpoint json /swagger/v1/swagger.json (this file contains endpoint/request/response/model shema) THIS IS THE STANDART OpenApi !!
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "SubSnap API v1");
        });
        //activate web interface, tells to UI to use this target file JSON
        return app;
    }

}
