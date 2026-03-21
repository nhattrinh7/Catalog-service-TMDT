import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { GetShopReviewsPaginatedQuery } from './get-shop-reviews-paginated.query'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { REVIEW_REPLY_REPOSITORY, type IReviewReplyRepository } from '~/domain/repositories/review-reply.repository.interface'

interface ShopReviewResponse extends Omit<ProductReview, 'userId' | 'images'> {
  images: string[]
  reply: {
    content: string
    createdAt: Date
  } | null
}

interface GetShopReviewsPaginatedResponse {
  items: ShopReviewResponse[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

@QueryHandler(GetShopReviewsPaginatedQuery)
export class GetShopReviewsPaginatedHandler
  implements IQueryHandler<GetShopReviewsPaginatedQuery, GetShopReviewsPaginatedResponse> {

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(REVIEW_REPLY_REPOSITORY)
    private readonly reviewReplyRepository: IReviewReplyRepository,
  ) {}

  async execute(query: GetShopReviewsPaginatedQuery): Promise<GetShopReviewsPaginatedResponse> {
    const { page, limit, shopId, ratings, search, startDate, endDate } = query

    const { items: reviews, meta } = await this.productRepository.findShopReviewsPaginated({
      shopId,
      page,
      limit,
      ratings,
      search,
      startDate,
      endDate,
    })

    const reviewIds = reviews.map((review) => review.id)

    const replies = await this.reviewReplyRepository.findByReviewIds(reviewIds)
    const replyMap = new Map(replies.map((reply) => [reply.reviewId, reply]))

    const items: ShopReviewResponse[] = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      shopId: review.shopId,
      orderId: review.orderId,
      buyerUsername: review.buyerUsername,
      buyerAvatar: review.buyerAvatar,
      productName: review.productName,
      productImage: review.productImage,
      sku: review.sku,
      rating: review.rating,
      content: review.content,
      images: Array.isArray(review.images) ? (review.images as string[]) : [],
      video: review.video,
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason,
      hiddenAt: review.hiddenAt,
      createdAt: review.createdAt,
      reply: replyMap.has(review.id)
        ? {
            content: replyMap.get(review.id)!.content,
            createdAt: replyMap.get(review.id)!.createdAt,
          }
        : null,
    }))

    return {
      items,
      meta,
    }
  }
}
