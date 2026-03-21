import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { GetProductReviewsPaginatedQuery } from '~/application/queries/get-product-reviews-paginated/get-product-reviews-paginated.query'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { REVIEW_REPLY_REPOSITORY, type IReviewReplyRepository } from '~/domain/repositories/review-reply.repository.interface'

interface UserInfo {
  id: string
  username: string
  avatar: string | null
}

interface ProductReviewWithUser extends Omit<ProductReview, 'userId'> {
  user: UserInfo
  reply: {
    content: string
    createdAt: Date
  } | null
}

interface GetProductReviewsPaginatedResponse {
  items: ProductReviewWithUser[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

@QueryHandler(GetProductReviewsPaginatedQuery)
export class GetProductReviewsPaginatedHandler 
  implements IQueryHandler<GetProductReviewsPaginatedQuery, GetProductReviewsPaginatedResponse> {
  
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
    @Inject(REVIEW_REPLY_REPOSITORY)
    private readonly reviewReplyRepository: IReviewReplyRepository,
  ) {}

  async execute(query: GetProductReviewsPaginatedQuery): Promise<GetProductReviewsPaginatedResponse> {
    const { productId, page, limit, rating, hasMedia } = query

    // 1. Lấy danh sách review của sản phẩm thông qua Product aggregate root
    // Tuân thủ DDD pattern: Review chỉ được truy cập thông qua Product
    const { items: reviews, meta } = await this.productRepository.findReviewsPaginated({
      productId,
      page,
      limit,
      rating,
      hasMedia,
    })

    // Nếu không có review thì trả về luôn
    if (reviews.length === 0) {
      return {
        items: [],
        meta,
      }
    }

    // 2. Lấy danh sách userIds từ reviews (unique)
    const userIds = [...new Set(reviews.map(r => r.userId))]
    
    // 3. Gọi user-service để lấy thông tin user
    const users = await this.messagePublisher.sendToUserService<{ userIds: string[] }, UserInfo[]>(
      'get.users_info',
      { userIds }
    )

    // Tạo map để lookup user nhanh
    const userMap = new Map(users.map(user => [user.id, user]))

    const reviewIds = reviews.map((review) => review.id)
    const replies = await this.reviewReplyRepository.findByReviewIds(reviewIds)
    const replyMap = new Map(replies.map((reply) => [reply.reviewId, reply]))

    // 4. Ghép thông tin user vào từng review
    const reviewsWithUser: ProductReviewWithUser[] = reviews.map(review => {
      const { userId, ...reviewWithoutUserId } = review
      return {
        ...reviewWithoutUserId,
        user: userMap.get(userId) || { id: userId, username: 'unknown', avatar: null },
        reply: replyMap.has(review.id)
          ? {
              content: replyMap.get(review.id)!.content,
              createdAt: replyMap.get(review.id)!.createdAt,
            }
          : null,
      }
    })

    return {
      items: reviewsWithUser,
      meta,
    }
  }
}
