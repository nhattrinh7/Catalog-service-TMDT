import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export class ProductReview {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly shopId: string,
    public readonly userId: string,
    public readonly orderId: string,
    public readonly buyerUsername: string,
    public readonly buyerAvatar: string | null,
    public readonly productName: string,
    public readonly productImage: string,
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
    shopId: string
    userId: string
    orderId: string
    buyerUsername: string
    buyerAvatar?: string | null
    productName: string
    productImage: string
    sku: string
    rating: number
    content?: string | null
    images?: string[] | null
    video?: string | null
  }): ProductReview {
    return new ProductReview(
      uuidv4(),
      props.productId,
      props.shopId,
      props.userId,
      props.orderId,
      props.buyerUsername,
      props.buyerAvatar ?? null,
      props.productName,
      props.productImage,
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
