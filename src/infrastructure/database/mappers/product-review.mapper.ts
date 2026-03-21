import { ProductReview as PrismaProductReview } from '@prisma/client'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { Prisma } from '@prisma/client'

export class ProductReviewMapper {
  static toDomain(prismaReview: PrismaProductReview): ProductReview {
    return new ProductReview(
      prismaReview.id,
      prismaReview.productId,
      prismaReview.shopId,
      prismaReview.userId,
      prismaReview.orderId,
      prismaReview.buyerUsername,
      prismaReview.buyerAvatar,
      prismaReview.productName,
      prismaReview.productImage,
      prismaReview.sku,
      prismaReview.rating,
      prismaReview.content,
      prismaReview.images,
      prismaReview.video,
      prismaReview.isHidden,
      prismaReview.hiddenReason,
      prismaReview.hiddenAt,
      prismaReview.createdAt,
    )
  }

  static toDomainArray(prismaReviews: PrismaProductReview[]): ProductReview[] {
    return prismaReviews.map(review => this.toDomain(review))
  }

  static toPersistence(review: ProductReview) {
    return {
      id: review.id,
      productId: review.productId,
      shopId: review.shopId,
      userId: review.userId,
      orderId: review.orderId,
      buyerUsername: review.buyerUsername,
      buyerAvatar: review.buyerAvatar,
      productName: review.productName,
      productImage: review.productImage,
      sku: review.sku,
      rating: review.rating,
      content: review.content,
      images: review.images as Prisma.InputJsonValue ?? Prisma.DbNull,
      video: review.video,
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason,
      hiddenAt: review.hiddenAt,
      createdAt: review.createdAt,
    }
  }
}

