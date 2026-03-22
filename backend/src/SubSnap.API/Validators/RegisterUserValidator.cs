using FluentValidation;
using SubSnap.Application.UseCases.Users.RegisterUser;

namespace SubSnap.API.Validators;

//Validator vive solo nell'API, non tocca Domain, Repository o DB!
//perfect che valida il Command
//PLUGIN FLUENTVALIDATION e libreria che ti evita di scrivere a mano e.g. if (string.IsNullOrEmpty(request.Email)){return BadRequest("Email required")};
/*
 HTTP Request -> mapped to RUCommand -> validator controlla RUCommand, .Application ricevera solo dati gia validati!!

!!!!QUESTO VALIDATOR VIENE CATTURATO DA ValidatorBehvior.cs!!! see validationbehaviour.cs  dependencyinjection.cs validationextensions.cs  RUHandler.cs
 */
public class RegisterUserValidator : AbstractValidator<RUCommand>  //abstractValidator<T> e FluentValidation. DEVI VALIDARE IL COMMAND, NON IL DTO, PERCHE IL COMMAND e L'OGGETTO CHE ARRIVA ALL'APPLICATION LAYER, DEVE ESSERE GIA VALIDATO PRIMA DI ARRIVARCI!
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Email must be a valid email address");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one digit")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage("Password must contain at least one special character");
    }
}
