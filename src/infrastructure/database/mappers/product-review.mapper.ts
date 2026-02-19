import { ProductReview as PrismaProductReview } from '@prisma/client'
import { ProductReview } from '~/domain/entities/product-review.entity'

export class ProductReviewMapper {
  static toDomain(prismaReview: PrismaProductReview): ProductReview {
    return new ProductReview(
      prismaReview.id,
      prismaReview.productId,
      prismaReview.userId,
      prismaReview.orderId,
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
}
