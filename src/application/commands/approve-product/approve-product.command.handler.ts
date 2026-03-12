import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ApproveProductCommand } from '~/application/commands/approve-product/approve-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PRODUCT_VARIANT_REPOSITORY, type IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { ProductSearchMapper } from '~/infrastructure/elasticsearch/mappers/product-search.mapper'
import { CACHE_EVENT, CACHE_RESOURCE, CACHE_TYPE } from '~/common/constants/cache.constant'

@CommandHandler(ApproveProductCommand)
export class ApproveProductHandler implements ICommandHandler<ApproveProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ApproveProductCommand) {
    const { id } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Gọi method approve() của entity
    product.approve()

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)

    // 4. Đồng bộ với Elasticsearch khi duyệt sản phẩm
    // Lấy variants của sản phẩm
    const variants = await this.productVariantRepository.findByProductId(id)
    
    // Lấy category name và category hierarchy
    const categoryHierarchy = await this.categoryRepository.getCategoryHierarchy(product.categoryId)
    const categoryName = categoryHierarchy.length > 0 ? categoryHierarchy[0] : ''

    // Tạo document Elasticsearch với buy_count = 0 và is_in_stock = true
    const productSearchDocument = ProductSearchMapper.toElasticDocument(
      product,
      variants,
      categoryName,
      categoryHierarchy,
      0, // buy_count = 0 cho sản phẩm mới duyệt
      true, // is_in_stock = true cho sản phẩm mới duyệt
    )
    // Index vào Elasticsearch
    await this.productSearchRepository.indexProduct(productSearchDocument)

    // Invalidate cache product detail
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.DETAIL, resource: CACHE_RESOURCE.PRODUCTS, id })
  }
}
