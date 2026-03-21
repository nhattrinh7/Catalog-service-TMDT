import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IReviewReplyRepository } from '~/domain/repositories/review-reply.repository.interface'
import { ReviewReply } from '~/domain/entities/review-reply.entity'
import { ReviewReplyMapper } from '~/infrastructure/database/mappers/review-reply.mapper'

@Injectable()
export class ReviewReplyRepository implements IReviewReplyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reply: ReviewReply, tx?: any): Promise<ReviewReply> {
    const client = tx ?? this.prisma
    const data = ReviewReplyMapper.toPersistence(reply)

    const created = await client.reviewReply.create({ data })

    return ReviewReplyMapper.toDomain(created)
  }

  async findByReviewId(reviewId: string): Promise<ReviewReply | null> {
    const reply = await this.prisma.reviewReply.findUnique({
      where: { reviewId },
    })

    return reply ? ReviewReplyMapper.toDomain(reply) : null
  }

  async findByReviewIds(reviewIds: string[]): Promise<ReviewReply[]> {
    if (reviewIds.length === 0) return []

    const replies = await this.prisma.reviewReply.findMany({
      where: { reviewId: { in: reviewIds } },
    })

    return replies.map((reply) => ReviewReplyMapper.toDomain(reply))
  }
}
