import { ReviewReply as PrismaReviewReply } from '@prisma/client'
import { ReviewReply } from '~/domain/entities/review-reply.entity'

export class ReviewReplyMapper {
  static toDomain(prismaReply: PrismaReviewReply): ReviewReply {
    return new ReviewReply(
      prismaReply.id,
      prismaReply.reviewId,
      prismaReply.shopId,
      prismaReply.content,
      prismaReply.createdAt,
    )
  }

  static toPersistence(reply: ReviewReply) {
    return {
      id: reply.id,
      reviewId: reply.reviewId,
      shopId: reply.shopId,
      content: reply.content,
      createdAt: reply.createdAt,
    }
  }
}
