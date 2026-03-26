import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject } from '@nestjs/common'
import { GetShopProductsPaginatedQuery } from '~/application/queries/get-shop-products-paginated/get-shop-products-paginated.query'
import { Product } from '~/domain/entities/product.entity'
import { PaginatedResult } from '~/domain/interfaces/pagination.interface'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

@QueryHandler(GetShopProductsPaginatedQuery)
export class GetShopProductsPaginatedHandler implements IQueryHandler<GetShopProductsPaginatedQuery, PaginatedResult<Product>> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async execute(query: GetShopProductsPaginatedQuery): Promise<PaginatedResult<Product>> {
    const { page, limit, search, isActive, approveStatus, shopId } = query

    const itemsAndMeta = await this.productRepository.findPaginated({
      page,
      limit,
      search,
      isActive,
      approveStatus,
      shopId,
    })

    const productIds = itemsAndMeta.items.map(item => item.id)

    // Gọi trực tiếp message publisher thay vì dùng event
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
    itemsAndMeta.items.forEach(product => {
      const variants = (product as any).variants || []
      variants.forEach((variant: any) => {
        const stockData = stockMap.get(variant.id)
        if (stockData) {
          variant.stock = stockData.stock
          variant.soldQuantity = stockData.soldQuantity
        } else {
          variant.stock = 0
          variant.soldQuantity = 0
        }
      })
    })

    return itemsAndMeta
  }
}
