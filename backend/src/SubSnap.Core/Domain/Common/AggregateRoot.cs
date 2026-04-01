namespace SubSnap.Core.Domain.Common;

/*
 * perche e.g. User è la root e Subscription è un children.
 * l'aggregate root (user) è l'unico punto di accesso per modificare i children.
User (Aggregate Root)
 ├── RefreshTokens
 ├── Subscription
 └── SharedLinks
see User.cs  transactionbehavior.cs  efunitofwork.cs  outboxprocessor.cs
 */
public abstract class AggregateRoot  //tutti gli aggregate roots lo implementeranno
{
    private readonly List<IDomainEvent> _events = new(); //i domain events non verranno pubblicati subito, ma raccolti e pubblicati dopo che la transazione è stata completata con successo (e.g. dopo che l'utente è stato salvato nel DB), così eviti di pubblicare eventi per operazioni che poi falliscono e vengono rollbackate, garantendo così la consistenza del sistema!! (e.g. se pubblichi evento 'UserRegistered' prima di salvare l'utente, e poi il salvataggio fallisce, avrai un evento 'UserRegistered' senza un utente corrispondente nel DB, creando inconsistenza). qui salvi tutti gli eventi che accadono dentor l'aggregate, ma non li pubblichi subito.

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _events.AsReadOnly();
    //esponi eventi come ReadOnlyCollection, cosi nessuno puo modificarli dall'esterno, ma solo leggerli.

    protected void Raise(IDomainEvent @event) => _events.Add(@event);
    //quando succede questo Raise(new UserRegistered(...));, allora viene registrato l'evento, ma non invia emails/chiama servizi/ ect.
    //REGISTRA EVENTO, ma non fa ancora e.g.invia emails. @ serializza l'obj

    public void ClearDomainEvents() => _events.Clear();
    //pulisce eventi dopo che sono stati pubblicati da MediatR, altrimenti li ri-pubblicheresti.
}
