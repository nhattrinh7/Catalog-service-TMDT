import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateReviewReplyCommand } from './create-review-reply.command'
import { ReviewReply } from '~/domain/entities/review-reply.entity'
import { REVIEW_REPLY_REPOSITORY, type IReviewReplyRepository } from '~/domain/repositories/review-reply.repository.interface'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'

@CommandHandler(CreateReviewReplyCommand)
export class CreateReviewReplyHandler implements ICommandHandler<CreateReviewReplyCommand, void> {
  constructor(
    @Inject(REVIEW_REPLY_REPOSITORY)
    private readonly reviewReplyRepository: IReviewReplyRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateReviewReplyCommand) {
    const { reviewId, shopId, content } = command

    const review = await this.productRepository.findReviewById(reviewId)

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (review.shopId !== shopId) {
      throw new BadRequestException('Review does not belong to this shop')
    }

    const existedReply = await this.reviewReplyRepository.findByReviewId(reviewId)

    if (existedReply) {
      throw new BadRequestException('Review already replied')
    }

    const reply = ReviewReply.create({ reviewId, shopId, content })

    await this.reviewReplyRepository.create(reply)
  }
}
