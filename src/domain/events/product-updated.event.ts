import { IEvent } from '@nestjs/cqrs'

export class ProductUpdatedEvent implements IEvent {
  constructor(
    public readonly data: {
      stockUpdates?: Array<{ productVariantId: string; stock: number }>
      variantsToCreate?: Array<{ productId: string; productVariantId: string; stock: number; shopId: string }>
      variantsToDelete?: string[]  // Danh sách variantIds cần soft delete
    }
  ) {}
}
