using FluentValidation;
using SubSnap.Application.UseCases.Auth.Login;

namespace SubSnap.API.Validators;

/*
 LoginCommand ha Email (value object) e string Password.
 Il VO Email viene creato da AutoMapper prima che il validator giri:
   - se email e vuota o malformata, il VO constructor lancia ArgumentException -> 400 via ExceptionMiddleware
   - questo validator aggiunge la validazione del campo Password prima che arrivi all'handler

 see validationbehaviour.cs  dependencyinjection.cs  validationextensions.cs
 */
public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required");
    }
}
