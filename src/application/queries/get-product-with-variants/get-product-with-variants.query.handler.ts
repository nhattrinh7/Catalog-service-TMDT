import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject } from '@nestjs/common'
import { GetProductWithVariantsQuery } from '~/application/queries/get-product-with-variants/get-product-with-variants.query'
import { IProductWithVariantsAndStock } from '~/domain/interfaces/product.interface'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

@QueryHandler(GetProductWithVariantsQuery)
export class GetProductWithVariantsHandler implements IQueryHandler<GetProductWithVariantsQuery, IProductWithVariantsAndStock | null> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
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

    return {
      ...product,
      variants: variantsWithStock,
    } as IProductWithVariantsAndStock
  }
}
