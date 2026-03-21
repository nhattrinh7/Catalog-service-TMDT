import { ReviewReply } from '~/domain/entities/review-reply.entity'

export interface IReviewReplyRepository {
  create(reply: ReviewReply, tx?: any): Promise<ReviewReply>
  findByReviewId(reviewId: string): Promise<ReviewReply | null>
  findByReviewIds(reviewIds: string[]): Promise<ReviewReply[]>
}

export const REVIEW_REPLY_REPOSITORY = Symbol('IReviewReplyRepository')
