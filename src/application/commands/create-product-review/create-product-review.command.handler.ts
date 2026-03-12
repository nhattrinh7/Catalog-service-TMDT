import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { CreateProductReviewCommand } from '~/application/commands/create-product-review/create-product-review.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(CreateProductReviewCommand)
export class CreateProductReviewHandler implements ICommandHandler<CreateProductReviewCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(command: CreateProductReviewCommand) {
    const { productId, userId, body } = command

    // Kiểm tra product tồn tại
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    // Tạo ProductReview entity
    const review = ProductReview.create({
      productId,
      userId,
      orderId: body.orderId,
      sku: body.sku,
      rating: body.rating,
      content: body.content,
      images: body.images,
      video: body.video,
    })

    // Wrap trong transaction: tạo review + cập nhật rating
    await this.prismaService.transaction(async (tx) => {
      // Lưu review
      await this.productRepository.createReview(review, tx)

      // Tính lại ratingAvg và ratingCount
      const newRatingCount = product.ratingCount + 1
      const newRatingAvg = parseFloat(
        (((product.ratingAvg * product.ratingCount) + body.rating) / newRatingCount).toFixed(1)
      )

      // Cập nhật rating trên product
      await this.productRepository.updateRating(productId, newRatingAvg, newRatingCount, tx)
    })
  }
}
