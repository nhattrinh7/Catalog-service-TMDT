import { IEvent } from '@nestjs/cqrs'

export class ProductCreatedEvent implements IEvent {
  constructor(
    public readonly variants: Array<{
      productId: string
      productVariantId: string
      stock: number
      shopId: string
    }>
  ) {}
}