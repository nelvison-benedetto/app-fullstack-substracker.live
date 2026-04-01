namespace SubSnap.Core.Domain.Exceptions;

public sealed class EmailAlreadyRegisteredException : DomainException  //derivano dal tuo custom DomainException!
{
    public EmailAlreadyRegisteredException(string email)
        : base($"Email '{email}' is already registered.") { }  //passa questo mex al constructor del father
}
//Se il service lancia EmailAlreadyRegisteredException, il middleware (ExceptionMiddlewareExtensions.cs) lo cattura come DomainException!! e restituisce 400 con il messaggio che hai definito in EmailAlreadyRegisteredExceptiona