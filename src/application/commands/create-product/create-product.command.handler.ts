import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { CreateProductCommand } from '~/application/commands/create-product/create-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject } from '@nestjs/common'
import { Product } from '~/domain/entities/product.entity'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { type IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { ProductCreatedEvent } from '~/domain/events/product-created.event'
import { OPTION_REPOSITORY, type IOptionRepository } from '~/domain/repositories/option.repository.interface'
import { OPTION_VALUE_REPOSITORY, type IOptionValueRepository } from '~/domain/repositories/option-value.repository.interface'
import { PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY, type IProductVariantOptionValueRepository } from '~/domain/repositories/product-variant-option-value.repository.interface'
import { Option } from '~/domain/entities/option.entity'
import { OptionValue } from '~/domain/entities/option-value.entity'

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    @Inject(OPTION_REPOSITORY)
    private readonly optionRepository: IOptionRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly optionValueRepository: IOptionValueRepository,
    @Inject(PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY)
    private readonly productVariantOptionValueRepository: IProductVariantOptionValueRepository,
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

    // Tạo Options và OptionValues từ classifications
    // Map: optionValueName -> optionValueId để dùng khi tạo ProductVariantOptionValue
    const optionValueNameToIdMap = new Map<string, string>()

    if (body.classifications && body.classifications.length > 0) {
      for (const classification of body.classifications) {
        // Tạo Option
        const option = Option.create({ name: classification.name })
        const savedOption = await this.optionRepository.create(option)

        // Tạo OptionValues cho option này
        const optionValues = classification.values.map(value =>
          OptionValue.create({ value, optionId: savedOption.id })
        )
        const savedOptionValues = await this.optionValueRepository.createMany(optionValues)

        // Lưu vào map để tra cứu sau
        for (const ov of savedOptionValues) {
          optionValueNameToIdMap.set(ov.value, ov.id)
        }
      }
    }

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

    // Tạo ProductVariantOptionValue (liên kết variant với optionValues)
    const productVariantOptionValuesData: { variantId: string; optionValueId: string }[] = []
    
    for (let i = 0; i < productVariants.length; i++) {
      const variant = productVariants[i]
      const variantData = body.variants[i]
      
      if (variantData.optionValues && variantData.optionValues.length > 0) {
        for (const optionValueName of variantData.optionValues) {
          const optionValueId = optionValueNameToIdMap.get(optionValueName)
          if (optionValueId) {
            productVariantOptionValuesData.push({
              variantId: variant.id,
              optionValueId,
            })
          }
        }
      }
    }

    if (productVariantOptionValuesData.length > 0) {
      await this.productVariantOptionValueRepository.createMany(productVariantOptionValuesData)
    }

    // Chuẩn bị các productVariantId, stock và shopId để gửi qua inventory-service
    const dataToSend = productVariants.map((variant, index) => ({
      productId: savedProduct.id,
      productVariantId: variant.id,
      stock: body.variants[index].stock, // Lấy stock từ body.variants
      shopId: body.shopId,
    }))

    // Bắn event
    this.eventBus.publish(new ProductCreatedEvent(dataToSend))
  }
}
