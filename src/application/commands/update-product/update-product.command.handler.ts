import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { UpdateProductCommand } from '~/application/commands/update-product/update-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
import { Product } from '~/domain/entities/product.entity'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { type IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { ProductUpdatedEvent } from '~/domain/events/product-updated.event'

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProductCommand) {
    const { id, body } = command

    console.log('id', id) // id này là id của sản phẩm
    console.log('body', body)

    // 1. Lấy product
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Update product (không bao gồm variants)
    product.update({
      name: body.name,
      descriptions: body.descriptions,
      attributes: body.attributes,
      mainImage: body.mainImage,
      galleryImage: body.galleryImage,
      video: body.video,
      unit: body.unit,
    })
    await this.productRepository.update(product)

    // 3. Lấy variants từ body
    const variantIds = body.variants.map(v => v.id)
    
    // 4. Fetch các variant entities từ DB
    const existingVariants = await this.productVariantRepository.findByIds(variantIds)
    
    // 5. Update từng variant (price, sku, image) - KHÔNG có stock
    existingVariants.forEach(variant => {
      const variantData = body.variants.find(v => v.id === variant.id)
      if (variantData) {
        variant.update({
          sku: variantData.sku,
          price: variantData.price,
          image: variantData.image,
        })
      }
    })
    
    // 6. Save updated variants
    await this.productVariantRepository.updateMany(existingVariants)

    // 7. Chuẩn bị data để emit sang inventory service
    const stockUpdates = body.variants.map(variant => ({
      productVariantId: variant.id,
      stock: variant.stock,
    }))

    // 8. Bắn event
    this.eventBus.publish(new ProductUpdatedEvent(stockUpdates))
  }
}
  