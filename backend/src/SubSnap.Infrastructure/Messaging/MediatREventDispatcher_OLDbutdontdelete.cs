//using MediatR;
//using SubSnap.Application.Ports.Messaging;
//using SubSnap.Core.Domain.Common;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace SubSnap.Infrastructure.Messaging;

//public sealed class MediatREventDispatcher : IEventDispatcher
//{
//    private readonly IMediator _mediator;

//    public MediatREventDispatcher(IMediator mediator)
//    {
//        _mediator = mediator;
//    }

//    public async Task DispatchAsync(
//        IReadOnlyCollection<IDomainEvent> events,
//        CancellationToken ct)
//    {
//        foreach (var domainEvent in events)
//        {
//            await _mediator.Publish(domainEvent, ct);
//        }
//    }
//}

//OLD. non piu necessario. better ora uso OutboxProcessor.cs come DISPATCHER async outbox pattern.