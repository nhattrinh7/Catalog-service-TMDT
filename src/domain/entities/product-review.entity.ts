import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

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

  static create(props: {
    productId: string
    userId: string
    orderId: string
    sku: string
    rating: number
    content?: string | null
    images?: string[] | null
    video?: string | null
  }): ProductReview {
    return new ProductReview(
      uuidv4(),
      props.productId,
      props.userId,
      props.orderId,
      props.sku,
      props.rating,
      props.content ?? null,
      props.images ?? null,
      props.video ?? null,
      false,
      null,
      null,
      new Date(),
    )
  }
}
