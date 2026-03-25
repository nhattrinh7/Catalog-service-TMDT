import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RejectProductCommand } from '~/application/commands/reject-product/reject-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CACHE_EVENT, CACHE_RESOURCE, CACHE_TYPE } from '~/common/constants/cache.constant'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'

@CommandHandler(RejectProductCommand)
export class RejectProductHandler implements ICommandHandler<RejectProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RejectProductCommand) {
    const { id, rejectReason, roleCategoryIds } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // ABAC: kiểm tra admin có quyền reject sản phẩm thuộc ngành hàng này không
    if (roleCategoryIds.length > 0) {
      const rootCategoryId = await this.categoryRepository.findRootCategoryId(product.categoryId)
      if (!rootCategoryId || !roleCategoryIds.includes(rootCategoryId)) {
        throw new ForbiddenException('Bạn không có quyền từ chối sản phẩm thuộc ngành hàng này')
      }
    }

    // 2. Gọi method reject() của entity
    product.reject(rejectReason)

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)

    // Invalidate cache product detail
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.DETAIL, resource: CACHE_RESOURCE.PRODUCTS, id })
  }
}
