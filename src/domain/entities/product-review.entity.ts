import { Prisma } from '@prisma/client'

export class ProductReview {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly userId: string,
    public readonly orderId: string,
    public readonly sku: string,
    public rating: number,
    public content: string | null,
    public images: Prisma.JsonValue | null,
    public video: string | null,
    public isHidden: boolean,
    public hiddenReason: string | null,
    public hiddenAt: Date | null,
    public readonly createdAt: Date,
  ) {}
}
