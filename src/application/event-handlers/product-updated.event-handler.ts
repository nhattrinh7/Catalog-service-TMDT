import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { ProductUpdatedEvent } from '~/domain/events/product-updated.event'
import { Inject } from '@nestjs/common'
import { type IMessagePublisher, MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'

@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedEventHandler implements IEventHandler<ProductUpdatedEvent> {
  constructor(
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  handle(event: ProductUpdatedEvent): void {
    this.messagePublisher.emitToInventoryService('product.updated', event)
  }
}
