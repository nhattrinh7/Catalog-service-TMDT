import { IEvent } from '@nestjs/cqrs'

export class ProductUpdatedEvent implements IEvent {
  constructor(
    public readonly variants: Array<{
      productVariantId: string
      stock: number
    }>
  ) {}
}
