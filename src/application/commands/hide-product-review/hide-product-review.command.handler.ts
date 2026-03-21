import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { HideProductReviewCommand } from '~/application/commands/hide-product-review/hide-product-review.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'

@CommandHandler(HideProductReviewCommand)
export class HideProductReviewHandler implements ICommandHandler<HideProductReviewCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: HideProductReviewCommand) {
    const { reviewId } = command

    const review = await this.productRepository.findReviewById(reviewId)
    if (!review) throw new NotFoundException('Review not found')

    await this.productRepository.hideReview(reviewId)
  }
}
