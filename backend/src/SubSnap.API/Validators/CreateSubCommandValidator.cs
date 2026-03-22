using FluentValidation;
using SubSnap.Application.UseCases.Subscriptions.CreateSubscription;

namespace SubSnap.API.Validators;

public class CreateSubCommandValidator : AbstractValidator<CreateSubCommand>
{
    public CreateSubCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");

        RuleFor(x => x.BillingCycle)
            .NotEmpty().WithMessage("Billing cycle is required")
            .MaximumLength(50).WithMessage("Billing cycle cannot exceed 50 characters");
    }
}
