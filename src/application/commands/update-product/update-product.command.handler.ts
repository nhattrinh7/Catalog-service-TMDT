import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { UpdateProductCommand } from '~/application/commands/update-product/update-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
import { type IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { CACHE_EVENT, CACHE_RESOURCE, CACHE_TYPE } from '~/common/constants/cache.constant'
import { ProductUpdatedEvent } from '~/domain/events/product-updated.event'
import { OPTION_REPOSITORY, type IOptionRepository } from '~/domain/repositories/option.repository.interface'
import { OPTION_VALUE_REPOSITORY, type IOptionValueRepository } from '~/domain/repositories/option-value.repository.interface'
import { PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY, type IProductVariantOptionValueRepository } from '~/domain/repositories/product-variant-option-value.repository.interface'
import { OptionValue } from '~/domain/entities/option-value.entity'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { ProductSearchMapper } from '~/infrastructure/elasticsearch/mappers/product-search.mapper'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand, void> {
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
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
    private readonly eventBus: EventBus,
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
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

    // Wrap tất cả DB writes trong transaction
    const { variantsToUpdate, newVariantEntities, variantsToCreate, variantsToDelete } = await this.prismaService.transaction(async (tx) => {
      await this.productRepository.update(product, tx)

      // 4. Xử lý variants
      return await this.handleVariants(id, body, product.shopId, tx)
    })

    // 5. Đồng bộ với Elasticsearch CHỈ KHI trạng thái là ACCEPTED (NGOÀI transaction)
    if (product.approveStatus === 'ACCEPTED') {
      // Lấy lại variants sau khi update (chỉ lấy những variant chưa bị soft delete)
      const updatedVariants = await this.productVariantRepository.findByProductId(id)
      
      // Lấy category name và category hierarchy
      const categoryHierarchy = await this.categoryRepository.getCategoryHierarchy(product.categoryId)
      const categoryName = categoryHierarchy.length > 0 ? categoryHierarchy[0] : ''

      // Lấy productVariantIds để gọi inventory-service
      const productVariantIds = updatedVariants.map(v => v.id)

      // Gọi inventory-service để lấy buy_count và is_in_stock
      const inventoryData = await this.messagePublisher.sendToInventoryService<
        { productVariantIds: string[] },
        { buyCount: number; isInStock: boolean }
      >('get.buy.count', { productVariantIds })

      const productSearchDocument = ProductSearchMapper.toElasticDocument(
        product,
        updatedVariants,
        categoryName,
        categoryHierarchy,
        inventoryData.buyCount,
        inventoryData.isInStock,
      )

      await this.productSearchRepository.updateProduct(id, productSearchDocument)
    }
    // Nếu trạng thái là PENDING hoặc REJECTED, không cập nhật Elasticsearch

    // 9. Chuẩn bị data để emit sang inventory service
    const stockUpdates = variantsToUpdate.map((v: any) => ({
      productVariantId: v.id,
      stock: v.stock,
    }))

    const variantsToCreateData = newVariantEntities.map((variant, index) => ({
      productId: id,
      productVariantId: variant.id,
      stock: variantsToCreate[index].stock,
      shopId: product.shopId,
    }))

    const variantsToDeleteIds = variantsToDelete.map(v => v.id)

    // 10. Bắn event NGOÀI transaction
    this.eventBus.publish(new ProductUpdatedEvent({
      stockUpdates,
      variantsToCreate: variantsToCreateData,
      variantsToDelete: variantsToDeleteIds,
    }))

    // Invalidate cache product detail
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.DETAIL, resource: CACHE_RESOURCE.PRODUCTS, id })
  }

  /**
   * Xử lý variants - dữ liệu luôn có classifications
   * - Không cho thêm option mới, chỉ dùng option đã có
   * - Có thể thêm option value mới
   * - Có thể bớt option hoặc option value (soft delete variants tương ứng)
   */
  private async handleVariants(productId: string, body: any, shopId: string, tx: any) {
    // 1. Lấy tất cả variants hiện có của product (chỉ lấy những variant chưa bị soft delete)
    const existingVariants = await this.productVariantRepository.findByProductId(productId)
    
    // 2. Tạo map để tra cứu OptionValue ID từ value name
    const optionValueNameToIdMap = new Map<string, string>()

    for (const classification of body.classifications) {
      // Tìm Option đã có (KHÔNG tạo mới)
      const option = await this.optionRepository.findByName(classification.name)
      if (!option) {
        // Nếu không tìm thấy option, skip (không nên xảy ra vì FE không cho thêm option mới)
        console.warn(`Option "${classification.name}" not found, skipping...`)
        continue
      }

      // Tìm hoặc tạo OptionValues
      const existingOptionValues = await this.optionValueRepository.findByValues(classification.values)
      const existingValuesMap = new Map(existingOptionValues.map(ov => [ov.value, ov.id]))

      // Tìm các value mới cần tạo
      const newValues = classification.values.filter((v: string) => !existingValuesMap.has(v))
      if (newValues.length > 0) {
        const optionValues = newValues.map((value: string) =>
          OptionValue.create({ value, optionId: option.id })
        )
        const savedOptionValues = await this.optionValueRepository.createMany(optionValues, tx)
        savedOptionValues.forEach(ov => existingValuesMap.set(ov.value, ov.id))
      }

      // Lưu vào map để tra cứu sau
      classification.values.forEach((value: string) => {
        const id = existingValuesMap.get(value)
        if (id) optionValueNameToIdMap.set(value, id)
      })
    }

    // 2.1. Xử lý xóa options và option values bị bỏ
    if (body.classifications && body.classifications.length > 0) {
      // Lấy tất cả options hiện có của product
      const existingOptions = await this.optionRepository.findByProductId(productId)
      
      // Tìm options bị bỏ (có trong DB nhưng không có trong request)
      const incomingOptionNames = body.classifications.map((c: any) => c.name)
      const optionsToDelete = existingOptions.filter(opt => !incomingOptionNames.includes(opt.name))
      
      if (optionsToDelete.length > 0) {
        const optionIdsToDelete = optionsToDelete.map(opt => opt.id)
        
        // Xóa option values của các options bị bỏ
        const optionValuesToDelete = await this.optionValueRepository.findByOptionIds(optionIdsToDelete)
        if (optionValuesToDelete.length > 0) {
          const optionValueIdsToDelete = optionValuesToDelete.map(ov => ov.id)
          
          // QUAN TRỌNG: Xóa liên kết ProductVariantOptionValue TRƯỚC
          await this.productVariantOptionValueRepository.deleteByOptionValueIds(optionValueIdsToDelete, tx)
          
          // Sau đó mới xóa option values
          await this.optionValueRepository.deleteByIds(optionValueIdsToDelete, tx)
        }
        
        // Xóa options
        await this.optionRepository.deleteByIds(optionIdsToDelete, tx)
      }
      
      // Xử lý option values bị bỏ trong các options còn lại
      for (const classification of body.classifications) {
        const option = await this.optionRepository.findByName(classification.name)
        if (option) {
          // Lấy tất cả option values hiện có của option này
          const existingOptionValues = await this.optionValueRepository.findByOptionIds([option.id])
          
          // Tìm option values bị bỏ
          const valuesToDelete = existingOptionValues.filter(
            ov => !classification.values.includes(ov.value)
          )
          
          if (valuesToDelete.length > 0) {
            const optionValueIdsToDelete = valuesToDelete.map(ov => ov.id)
            
            // QUAN TRỌNG: Xóa liên kết ProductVariantOptionValue TRƯỚC
            await this.productVariantOptionValueRepository.deleteByOptionValueIds(optionValueIdsToDelete, tx)
            
            // Sau đó mới xóa option values
            await this.optionValueRepository.deleteByIds(optionValueIdsToDelete, tx)
          }
        }
      }
    }


    // 3. Tạo map SKU để tra cứu nhanh
    const existingSkuMap = new Map(existingVariants.map(v => [v.sku, v]))
    
    // 4. Phân loại variants dựa trên SKU (KHÔNG dựa vào ID)
    const variantsToUpdate: any[] = []
    const variantsToCreate: any[] = []
    
    body.variants.forEach((v: any) => {
      const existingVariant = existingSkuMap.get(v.sku)
      if (existingVariant) {
        // SKU đã tồn tại trong DB → Update variant này
        variantsToUpdate.push({ ...v, id: existingVariant.id })
      } else {
        // SKU chưa có trong DB → Tạo variant mới
        variantsToCreate.push(v)
      }
    })

    // 5. Xác định variants cần soft delete (SKU có trong DB nhưng không có trong request)
    const incomingSkus = body.variants.map(v => v.sku)
    const variantsToDelete = existingVariants.filter(v => !incomingSkus.includes(v.sku))
    
    // 6. Soft delete variants bị loại bỏ
    if (variantsToDelete.length > 0) {
      const idsToDelete = variantsToDelete.map(v => v.id)
      await this.productVariantRepository.softDeleteByIds(idsToDelete, tx)
      
      // Xóa liên kết ProductVariantOptionValue
      await this.productVariantOptionValueRepository.deleteByVariantIds(idsToDelete, tx)
    }

    // 7. Update variants có id
    if (variantsToUpdate.length > 0) {
      const variantIds = variantsToUpdate.map(v => v.id)
      const variantEntities = await this.productVariantRepository.findByIds(variantIds)
      
      variantEntities.forEach(variant => {
        const variantData = variantsToUpdate.find(v => v.id === variant.id)
        if (variantData) {
          variant.update({
            sku: variantData.sku,
            price: variantData.price,
            image: variantData.image,
          })
        }
      })
      
      await this.productVariantRepository.updateMany(variantEntities, tx)
    }

    // 8. Tạo variants mới
    const newVariantEntities: ProductVariant[] = []
    const newVariantOptionValues: { variantId: string; optionValueId: string }[] = []
    
    if (variantsToCreate.length > 0) {
      const variantEntities = variantsToCreate.map((v: any) =>
        ProductVariant.create({
          productId,
          sku: v.sku,
          price: v.price,
          image: v.image,
        })
      )
      
      await this.productVariantRepository.createMany(variantEntities, tx)
      newVariantEntities.push(...variantEntities)
      
      // Tạo liên kết ProductVariantOptionValue cho variants mới
      for (let i = 0; i < variantEntities.length; i++) {
        const variant = variantEntities[i]
        const variantData = variantsToCreate[i]
        
        if (variantData.optionValues && variantData.optionValues.length > 0) {
          for (const optionValueName of variantData.optionValues) {
            const optionValueId = optionValueNameToIdMap.get(optionValueName)
            if (optionValueId) {
              newVariantOptionValues.push({
                variantId: variant.id,
                optionValueId,
              })
            }
          }
        }
      }
      
      if (newVariantOptionValues.length > 0) {
        await this.productVariantOptionValueRepository.createMany(newVariantOptionValues, tx)
      }
    }

    return { variantsToUpdate, newVariantEntities, variantsToCreate, variantsToDelete }
  }
}