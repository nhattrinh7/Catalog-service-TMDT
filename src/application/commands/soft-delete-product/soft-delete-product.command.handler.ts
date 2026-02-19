import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { SoftDeleteProductCommand } from './soft-delete-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { PRODUCT_VARIANT_REPOSITORY, type IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(SoftDeleteProductCommand)
export class SoftDeleteProductHandler implements ICommandHandler<SoftDeleteProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
    private readonly prismaService: PrismaService,
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

    // Lấy tất cả variant IDs để soft delete
    const existingVariants = await this.productVariantRepository.findByProductId(productId)
    const variantIds = existingVariants.map(v => v.id)

    // Wrap DB writes trong transaction
    await this.prismaService.transaction(async (tx) => {
      // Cập nhật product vào database
      await this.productRepository.update(product, tx)

      // Soft delete tất cả các variant của product
      if (variantIds.length > 0) {
        await this.productVariantRepository.softDeleteByIds(variantIds, tx)
      }
    })

    // Xóa document trong Elasticsearch CHỈ KHI trạng thái là ACCEPTED (NGOÀI transaction)
    // Nếu PENDING hoặc REJECTED thì không có trong Elasticsearch nên không cần xóa
    if (product.approveStatus === 'ACCEPTED') {
      await this.productSearchRepository.deleteProduct(productId)
    }
  }
}
