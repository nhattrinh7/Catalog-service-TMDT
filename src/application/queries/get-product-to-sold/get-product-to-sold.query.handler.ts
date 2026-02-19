import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
import { GetProductToSoldQuery } from '~/application/queries/get-product-to-sold/get-product-to-sold.query'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { IProductToSold } from '~/domain/interfaces/product-to-sold.interface'

interface ShopDetailInfo {
  id: string
  name: string
  logo: string | null
  createdAt: Date
}

@QueryHandler(GetProductToSoldQuery)
export class GetProductToSoldHandler implements IQueryHandler<GetProductToSoldQuery, IProductToSold | null> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {}
 
  async execute(query: GetProductToSoldQuery): Promise<IProductToSold | null> {
    const { productId } = query

    // 1. Lấy thông tin product với variants
    const product = await this.productRepository.findByIdWithVariants(productId)
    
    if (!product) return null

    // 2. Gọi inventory-service để lấy stock, soldQuantity, availableQuantity
    const productIds = [product.id]
    
    const stocksResponse = await this.messagePublisher.sendToInventoryService<
      { productIds: string[] },
      { stocks: Array<{ productId: string; variants: Array<{ productVariantId: string; stock: number; soldQuantity: number }> }> }
    >('get.stocks', { productIds })

    // Tạo map để lookup stock theo productVariantId
    const stockMap = new Map<string, { stock: number; soldQuantity: number }>()
    stocksResponse.stocks.forEach(productStock => {
      productStock.variants.forEach(variant => {
        stockMap.set(variant.productVariantId, {
          stock: variant.stock,
          soldQuantity: variant.soldQuantity,
        })
      })
    })

    // Tính tổng soldQuantity và availableQuantity của sản phẩm
    let totalSoldQuantity = 0
    let totalAvailableQuantity = 0
    
    product.variants.forEach(variant => {
      const stockData = stockMap.get(variant.id)
      if (stockData) {
        totalSoldQuantity += stockData.soldQuantity
        totalAvailableQuantity += stockData.stock
      }
    })

    // Map variants với stock
    const variantsWithStock = product.variants.map(variant => {
      const stockData = stockMap.get(variant.id)
      return {
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        image: variant.image,
        stock: stockData?.stock ?? 0,
      }
    })

    // 3. Gọi shop-service để lấy thông tin shop
    const shopIds = [product.shopId]
    
    const shops = await this.messagePublisher.sendToShopService<
      { shopIds: string[] }, 
      ShopDetailInfo[]
    >('get.shop.simple_data', { shopIds })

    const shopInfo = shops[0] || null
    
    if (!shopInfo) throw new NotFoundException(`Shop with id ${product.shopId} not found`)
    
    // 4. Đếm số sản phẩm của shop
    const productCount = await this.productRepository.countProductAmountByShopId(product.shopId)

    // 5. Combine tất cả dữ liệu
    return {
      id: product.id,
      name: product.name,
      description: product.descriptions,
      attributes: product.attributes,
      mainImage: product.mainImage,
      galleryImage: product.galleryImage,
      video: product.video,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      unit: product.unit,
      soldQuantity: totalSoldQuantity,
      availableQuantity: totalAvailableQuantity,
      variants: variantsWithStock,
      shop: {
        id: shopInfo.id,
        name: shopInfo.name,
        logo: shopInfo.logo,
        productCount,
        createdAt: shopInfo.createdAt,
      },
    }
  }
}
