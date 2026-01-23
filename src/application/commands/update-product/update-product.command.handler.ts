import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { UpdateProductCommand } from '~/application/commands/update-product/update-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
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

    // 1. Lấy product
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Kiểm tra approveStatus và chuẩn bị dữ liệu update
    const isRejected = product.approveStatus === 'REJECTED'
    
    // 3. Update product (không bao gồm variants)
    product.update({
      name: body.name,
      descriptions: body.descriptions,
      attributes: body.attributes,
      mainImage: body.mainImage,
      galleryImage: body.galleryImage,
      video: body.video,
      unit: body.unit,
      // Nếu sản phẩm đang update từng bị reject, cập nhật approveStatus thành PENDING để xin duyệt lại
      ...(isRejected && { approveStatus: 'PENDING' }),
    })
    await this.productRepository.update(product)

    // 4. Lấy variants từ body
    const variantIds = body.variants.map(v => v.id)
    
    // 5. Fetch các variant entities từ DB
    const existingVariants = await this.productVariantRepository.findByIds(variantIds)
    
    // 6. Update từng variant (price, sku, image) - KHÔNG có stock
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
    
    // 7. Save updated variants
    await this.productVariantRepository.updateMany(existingVariants)

    // 8. Chuẩn bị data để emit sang inventory service
    const stockUpdates = body.variants.map(variant => ({
      productVariantId: variant.id,
      stock: variant.stock,
    }))

    // 9. Bắn event
    this.eventBus.publish(new ProductUpdatedEvent(stockUpdates))
  }
}
  