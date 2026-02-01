import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { SoftDeleteProductCommand } from './soft-delete-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'

@CommandHandler(SoftDeleteProductCommand)
export class SoftDeleteProductHandler implements ICommandHandler<SoftDeleteProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
  ) {}

  async execute(command: SoftDeleteProductCommand): Promise<void> {
    const { productId, deletedBy } = command

    // Tìm product theo id
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }

    // Gọi method softDelete của entity
    product.softDelete(deletedBy)

    // Cập nhật vào database
    await this.productRepository.update(product)

    // Xóa document trong Elasticsearch CHỈ KHI trạng thái là ACCEPTED
    // Nếu PENDING hoặc REJECTED thì không có trong Elasticsearch nên không cần xóa
    if (product.approveStatus === 'ACCEPTED') {
      await this.productSearchRepository.deleteProduct(productId)
    }
  }
}
