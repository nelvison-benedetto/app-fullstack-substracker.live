namespace SubSnap.API.StartupExtensions.Authorization;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddAuthorizationConfiguration(
        this IServiceCollection services)
    {
        services.AddAuthorization(options =>  //activate the system of auth policies (.net will use these rules when found '[Authorize]' !)
        {
            //policy 1.
            options.AddPolicy("UserOnly", policy =>  //create policy called 'UserOnly'
            {
                policy.RequireAuthenticatedUser();  //rule: you need to be authenticated
            });
            //so now u can use this policy w [Authorize(Policy = "UserOnly")], on the ur target endpoints

        });
        return services;
    }

}
