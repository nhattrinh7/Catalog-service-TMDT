import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetVariantsBatchQuery } from './get-variants-batch.query'
import type { IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'

interface VariantInfo {
  id: string
  productId: string
  productName: string
  price: number
  sku: string
  image: string | null
  shopId: string
  categoryId: string
}

interface GetVariantsBatchResponse {
  variants: VariantInfo[]
}

@QueryHandler(GetVariantsBatchQuery)
export class GetVariantsBatchHandler implements IQueryHandler<GetVariantsBatchQuery, GetVariantsBatchResponse> {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
  ) {}

  async execute(query: GetVariantsBatchQuery): Promise<GetVariantsBatchResponse> {
    const { productVariantIds } = query

    const variants = await this.variantRepository.findVariantsWithProductBatch(productVariantIds)

    return {
      variants: variants.map(variant => ({
        id: variant.id,
        productId: variant.productId,
        productName: variant.product.name,
        price: variant.price,
        sku: variant.sku,
        image: variant.image,
        shopId: variant.product.shopId,
        categoryId: variant.product.categoryId,
      })),
    }
  }
}
