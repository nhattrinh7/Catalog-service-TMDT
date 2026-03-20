import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { CreateProductReviewCommand } from '~/application/commands/create-product-review/create-product-review.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Prisma } from '@prisma/client'

@CommandHandler(CreateProductReviewCommand)
export class CreateProductReviewHandler implements ICommandHandler<CreateProductReviewCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(command: CreateProductReviewCommand) {
    const { productId, userId, body } = command

    // Kiá»ƒm tra product tá»“n táº¡i
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    // Táº¡o ProductReview entity
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

    // Wrap trong transaction: táº¡o review + cáº­p nháº­t rating
    try {
      await this.prismaService.transaction(async (tx) => {
        // LÆ°u review
        await this.productRepository.createReview(review, tx)

        // TÃ­nh láº¡i ratingAvg vÃ ratingCount
        const newRatingCount = product.ratingCount + 1
        const newRatingAvg = parseFloat(
          (((product.ratingAvg * product.ratingCount) + body.rating) / newRatingCount).toFixed(1)
        )

        // Cáº­p nháº­t rating trÃªn product
        await this.productRepository.updateRating(productId, newRatingAvg, newRatingCount, tx)
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Product already reviewed for this order')
      }
      throw error
    }
  }
}

