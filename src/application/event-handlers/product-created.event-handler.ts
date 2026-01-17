import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { ProductCreatedEvent } from '~/domain/events/product-created.event'
import { Inject,  } from '@nestjs/common'
import { type IMessagePublisher, MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'

@EventsHandler(ProductCreatedEvent)
export class ProductCreatedEventHandler implements IEventHandler<ProductCreatedEvent> {
  constructor(
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  handle(event: ProductCreatedEvent): void {
    this.messagePublisher.emitToInventoryService('product.created', event)
  }
}
