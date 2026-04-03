using Microsoft.AspNetCore.Mvc;

namespace SubSnap.API.StartupExtensions.Validation;

public static class ValidationExtensions
{
    public static IServiceCollection AddValidationConfiguration( this IServiceCollection services )
    {
        //Disabilita la validazione automatica ASP.NET per ModelState!! ora gestisco tutto io.
        //the validator FluentValidation vivono in SubSnap.Application e vengono registrati
        //tramite AddApplication() -> services.AddValidatorsFromAssembly(assembly).
        //check also ValidationBehavior.cs
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

        return services;
    }

}