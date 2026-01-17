import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { CreateProductCommand } from '~/application/commands/create-product/create-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject } from '@nestjs/common'
import { Product } from '~/domain/entities/product.entity'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { type IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { ProductCreatedEvent } from '~/domain/events/product-created.event'

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateProductCommand) {
    const { body } = command

    // Tạo product mới
    const product = Product.create({
      name: body.name,
      descriptions: body.descriptions,
      attributes: body.attributes,
      shopId: body.shopId,
      categoryId: body.categoryId,
      mainImage: body.mainImage,
      galleryImage: body.galleryImage,
      video: body.video,
      unit: body.unit
    })
    const savedProduct = await this.productRepository.create(product)

    // Lấy id của product mới cùng thông tin các product variant để tạo các product variant records
    const productVariants = body.variants.map((variantData) => 
      ProductVariant.create({
        productId: savedProduct.id,
        sku: variantData.sku,
        price: variantData.price,
        image: variantData.image,
      })
    )
    await this.productVariantRepository.createMany(productVariants)

    // Chuẩn bị các productVariantId, stock và shopId để gửi qua inventory-service
    const dataToSend = productVariants.map((variant, index) => ({
      productId: savedProduct.id,
      productVariantId: variant.id,
      stock: body.variants[index].stock, // Lấy stock từ body.variants
      shopId: body.shopId,
    }))

    // Bắn event
    this.eventBus.publish(new ProductCreatedEvent(
      dataToSend
    ))
  }
}
  