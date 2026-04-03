using SubSnap.API.Middleware.ExceptionHandling;
using SubSnap.API.StartupExtensions.Authentication;
using SubSnap.API.StartupExtensions.Authorization;
using SubSnap.API.StartupExtensions.CorrelationId;
using SubSnap.API.StartupExtensions.Cors;
using SubSnap.API.StartupExtensions.HealthChecks;
using SubSnap.API.StartupExtensions.Swagger;
using SubSnap.API.StartupExtensions.Validation;
using SubSnap.Application.DependencyInjection;
//using Microsoft.OpenApi.Models;
using SubSnap.Infrastructure.DependencyInjection;
using SubSnap.Infrastructure.Persistence.Context;

var builder = WebApplication.CreateBuilder(args);

// Sentry — error tracking, tracing, logs
builder.WebHost.UseSentry(o =>
{
    o.Dsn = builder.Configuration["Sentry:Dsn"];
    o.TracesSampleRate = 0.2;   //20% delle transazioni tracciate (non 1.0 in prod!)
    o.EnableLogs = true;        //ILogger → breadcrumbs + eventi di errore su Sentry
    o.SendDefaultPii = false;   //non mandare password / token
    o.Debug = false;            //metti true temporaneamente per debug locale
});

// Controllers
builder.Services.AddControllers();

//custom startup configs
builder.Services.AddValidationConfiguration();
builder.Services.AddCorsConfiguration();
builder.Services.AddSwaggerConfiguration();
builder.Services.AddAuthenticationConfiguration(builder.Configuration);
builder.Services.AddAuthorizationConfiguration();
builder.Services.AddHealthChecksConfiguration();

//validators. OLD now in .application uso plugin MediatR + plugin FluentValidation (check ValidationBehavior.cs) per validazione automatica, per non dover ogni volta esplicitare nel code. see more validationbehaviour.cs dependencyinjection.cs
//builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserValidator>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);  //here uso plugin Automapper, non plugin AutomapperExtension.ect altrimenti x c# c'e ambiguita x 'AddAutoMapper()'.

//.Application layer (BEFORE .infrastructure layer!)
builder.Services.AddApplication();

//.Infrastructure layer
builder.Services.AddInfrastructure(builder.Configuration);  //servicecollectionextensions.cs
    //qua accade DbContext, repositories concreti, unit of work, connection str

var app = builder.Build();  //crei l'istanza finale dell'app. ora elenchi i middlewares (http chain)

// Middleware pipeline
app.UseCorrelationId();  //1° nella chain: aggiunge X-Correlation-ID a ogni request
app.UseGlobalExceptionHandler();  //2° nella chain: cattura tutte le eccezioni non gestite, restituisce ApiResult.Fail al client
app.UseSentryTracing();  //3° abilita tracing HTTP: ogni request diventa una transaction su Sentry
app.UseSwaggerConfiguration();
app.UseCorsConfiguration();
//app.UseHttpsRedirection();
app.MapGet("/", () => "API OK");
app.UseAuthentication(); //legge JWT dal header, valida token, popola HttpContext.User
app.UseAuthorization();  //applica [Authorize]
app.UseHealthChecksConfiguration();

app.MapControllers();  //collega routing -> controller

app.MapGet("/health/db", async (ApplicationDbContext db) =>
{
    await db.Database.CanConnectAsync();
    return Results.Ok("DB OK");
});  
//is't technique CleanArchitecture, ma ok mi serve solo x check connessione su server backend<-->db!! testo on PostMan

app.Run();
