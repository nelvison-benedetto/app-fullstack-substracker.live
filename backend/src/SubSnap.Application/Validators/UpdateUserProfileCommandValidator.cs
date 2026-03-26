using FluentValidation;
using SubSnap.Application.UseCases.Users.UpdateUserProfile;

namespace SubSnap.Application.Validators;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        When(x => x.NewEmail is not null, () =>
        {
            RuleFor(x => x.NewEmail!)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters");
        });

        When(x => x.NewPassword is not null, () =>
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required when changing password");

            RuleFor(x => x.NewPassword!)
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Must contain at least one uppercase letter")
                .Matches("[0-9]").WithMessage("Must contain at least one number")
                .Matches(@"[!@#$%^&*(),.?"":{}|<>]").WithMessage("Must contain at least one special character");
        });

        RuleFor(x => x)
            .Must(x => x.NewEmail is not null || x.NewPassword is not null)
            .WithMessage("At least one field (email or password) must be provided for update");
    }
}
