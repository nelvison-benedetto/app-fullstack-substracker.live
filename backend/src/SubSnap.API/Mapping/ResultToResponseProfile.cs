using AutoMapper;
using SubSnap.API.Contracts.Auth.Responses;
using SubSnap.API.Contracts.Subscriptions.Responses;
using SubSnap.API.Contracts.Users.Responses;
using SubSnap.Application.UseCases.Auth.Login;
using SubSnap.Application.UseCases.Auth.RefreshToken;
using SubSnap.Application.UseCases.Subscriptions.CreateSubscription;
using SubSnap.Application.UseCases.Subscriptions.GetSubscriptionDetail;
using SubSnap.Application.UseCases.Subscriptions.GetUserSubscriptions;
using SubSnap.Application.UseCases.Subscriptions.UpdateSubscription;
using SubSnap.Application.UseCases.Users.GetUserProfile;
using SubSnap.Application.UseCases.Users.RegisterUser;
using SubSnap.Application.UseCases.Users.UpdateUserProfile;

namespace SubSnap.API.Mapping;

public sealed class ResultToResponseProfile : Profile
{
    public ResultToResponseProfile()
    {
        //Auth
        CreateMap<LoginResult, LoginResponseAuth>();
        CreateMap<RTResult, RefreshTokenResponseAuth>();
        CreateMap<RUResult, RegisterUserResponse>();

        //Subscriptions
        CreateMap<GetUserSubsResult, SubscriptionResponse>();
        CreateMap<CreateSubResult, SubscriptionResponse>();
        CreateMap<UpdateSubResult, SubscriptionResponse>();
        CreateMap<GetSubDetailResult, SubscriptionDetailResponse>();
        CreateMap<SubHistoryItemResult, SubHistoryItemResponse>();

        //User Profile
        CreateMap<GetUserProfileResult, UserProfileResponse>();
        CreateMap<UpdateUserProfileResult, UserProfileResponse>();
    }
}
