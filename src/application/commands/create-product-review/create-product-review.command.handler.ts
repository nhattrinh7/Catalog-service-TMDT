import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { CreateProductReviewCommand } from '~/application/commands/create-product-review/create-product-review.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(CreateProductReviewCommand)
export class CreateProductReviewHandler implements ICommandHandler<CreateProductReviewCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(command: CreateProductReviewCommand) {
    const { productId, userId, body } = command

    // Kiểm tra product tồn tại
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const existedReview = await this.productRepository.existsReviewByOrderAndProduct({
      orderId: body.orderId,
      productId,
    })

    if (existedReview) {
      throw new BadRequestException('Product already reviewed for this order')
    }

    // Tạo ProductReview entity
    const review = ProductReview.create({
      productId,
      shopId: product.shopId,
      userId,
      orderId: body.orderId,
      buyerUsername: body.buyerUsername,
      buyerAvatar: body.buyerAvatar ?? null,
      productName: body.productName,
      productImage: product.mainImage,
      sku: body.sku,
      rating: body.rating,
      content: body.content,
      images: body.images,
      video: body.video,
    })

    const newRatingCount = product.ratingCount + 1
    const newRatingAvg = ((product.ratingAvg * product.ratingCount) + body.rating) / newRatingCount

    await this.prismaService.transaction(async (tx) => {
      await this.productRepository.createReview(review, tx)
      await this.productRepository.updateRating(productId, newRatingAvg, newRatingCount, tx)
    })

    if (product.approveStatus === 'ACCEPTED') {
      await this.productSearchRepository.updateProduct(productId, {
        ratingAvg: newRatingAvg,
      })
    }
  }
}
