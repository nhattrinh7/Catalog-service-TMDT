import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject } from '@nestjs/common'
import { GetProductWithVariantsQuery } from '~/application/queries/get-product-with-variants/get-product-with-variants.query'
import { IProductWithVariantsAndClassifications } from '~/domain/interfaces/product.interface'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY, type IProductVariantOptionValueRepository } from '~/domain/repositories/product-variant-option-value.repository.interface'

@QueryHandler(GetProductWithVariantsQuery)
export class GetProductWithVariantsHandler implements IQueryHandler<GetProductWithVariantsQuery, IProductWithVariantsAndClassifications | null> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
    @Inject(PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY)
    private readonly productVariantOptionValueRepository: IProductVariantOptionValueRepository,
  ) {}

  async execute(query: GetProductWithVariantsQuery) {
    const { id } = query

    const product = await this.productRepository.findByIdWithVariants(id)
    
    if (!product) return null

    // Gọi inventory service để lấy stock và soldQuantity
    // productIds chỉ chứa 1 id
    const productIds = [product.id]
    
    const stocksResponse = await this.messagePublisher.sendToInventoryService<
      { productIds: string[] },
      { stocks: Array<{ productId: string; variants: Array<{ productVariantId: string; stock: number; soldQuantity: number }> }> }
    >('get.stocks', { productIds })

    // Tạo map để lookup stock và soldQuantity theo productVariantId nhanh hơn
    const stockMap = new Map<string, { stock: number; soldQuantity: number }>()
    stocksResponse.stocks.forEach(productStock => {
      productStock.variants.forEach(variant => {
        stockMap.set(variant.productVariantId, {
          stock: variant.stock,
          soldQuantity: variant.soldQuantity,
        })
      })
    })

    // Map stock và soldQuantity vào từng variant của product
    const variantsWithStock = product.variants.map(variant => {
      const stockData = stockMap.get(variant.id)
      return {
        ...variant,
        stock: stockData?.stock ?? 0,
        soldQuantity: stockData?.soldQuantity ?? 0,
      }
    })

    // Lấy thông tin classifications từ ProductVariantOptionValue
    const variantIds = product.variants.map(v => v.id)
    const pvovData = variantIds.length > 0 
      ? await this.productVariantOptionValueRepository.findByVariantIds(variantIds)
      : []

    // Group theo option name để tạo classifications
    const classificationsMap = new Map<string, Set<string>>()
    pvovData.forEach(pvov => {
      const optionName = pvov.optionValue.option.name
      const optionValue = pvov.optionValue.value
      if (!classificationsMap.has(optionName)) {
        classificationsMap.set(optionName, new Set())
      }
      classificationsMap.get(optionName)!.add(optionValue)
    })

    const classifications = Array.from(classificationsMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))

    return {
      ...product,
      variants: variantsWithStock,
      classifications,
    } as IProductWithVariantsAndClassifications
  }
}
