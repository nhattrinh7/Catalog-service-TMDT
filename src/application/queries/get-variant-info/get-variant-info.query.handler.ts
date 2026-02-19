import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { GetVariantInfoQuery } from './get-variant-info.query'
import type { IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'

interface VariantInfoResponse {
  id: string
  productId: string
  name: string
  price: number
  image: string | null
  sku: string
  shopId: string
}

@QueryHandler(GetVariantInfoQuery)
export class GetVariantInfoHandler implements IQueryHandler<GetVariantInfoQuery, VariantInfoResponse> {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
  ) {}

  async execute(query: GetVariantInfoQuery): Promise<VariantInfoResponse> {
    const { productVariantId } = query

    const variant = await this.variantRepository.findVariantWithProduct(productVariantId)
    
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${productVariantId} not found`)
    }

    return {
      id: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      price: variant.price,
      image: variant.image,
      sku: variant.sku,
      shopId: variant.product.shopId,
    }
  }
}
