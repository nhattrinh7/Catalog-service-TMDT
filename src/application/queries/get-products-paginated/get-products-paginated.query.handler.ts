import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { GetProductsPaginatedQuery } from '~/application/queries/get-products-paginated/get-products-paginated.query'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

interface ShopInfo {
  id: string
  name: string
  logo: string | null
}

interface GetProductsPaginatedResponse {
  products: any[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

@QueryHandler(GetProductsPaginatedQuery)
export class GetProductsPaginatedHandler implements IQueryHandler<GetProductsPaginatedQuery, GetProductsPaginatedResponse> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async execute(query: GetProductsPaginatedQuery): Promise<GetProductsPaginatedResponse> {
    const { page, limit, search, approveStatus, roleId } = query

    // 1. Gọi user-service lấy leaf categoryIds theo roleId
    const categoryIds = await this.messagePublisher.sendToUserService<string, string[]>(
      'get.leaf_categoryIds',
      roleId
    )

    // Nếu không có category nào thì trả về empty
    if (!categoryIds || categoryIds.length === 0) {
      return {
        products: [],
        meta: { total: 0, page, limit, totalPages: 0 }
      }
    }

    // 2. Lấy sản phẩm theo categoryIds, approveStatus, search
    const { items: products, meta } = await this.productRepository.findPaginatedByCategoryIds({
      page,
      limit,
      search,
      approveStatus,
      categoryIds,
    })

    // Nếu không có sản phẩm thì trả về luôn
    if (products.length === 0) {
      return {
        products: [],
        meta,
      }
    }

    // 3. Lấy danh sách shopIds từ products (unique)
    const shopIds = [...new Set(products.map(p => p.shopId))]
    
    // Gọi shop-service để lấy thông tin shop
    const shops = await this.messagePublisher.sendToShopService<{ shopIds: string[] }, ShopInfo[]>(
      'get.shop',
      { shopIds }
    )

    // Tạo map để lookup shop nhanh
    const shopMap = new Map(shops.map(shop => [shop.id, shop]))

    // 4. Lấy danh sách categoryIds từ products (unique)
    const productCategoryIds = [...new Set(products.map(p => p.categoryId))]
    
    // Lấy thông tin category
    const categories = await Promise.all(
      productCategoryIds.map(id => this.categoryRepository.getCategory(id))
    )
    
    // Tạo map để lookup category nhanh
    const categoryMap = new Map(
      categories.filter(c => c !== null).map(c => [c.id, { id: c.id, name: c.name }])
    )

    // 5. Ghép thông tin shop và category vào từng sản phẩm
    const productsWithDetails = products.map(product => ({
      ...product,
      shop: shopMap.get(product.shopId) || null,
      category: categoryMap.get(product.categoryId) || null,
    }))

    return {
      products: productsWithDetails,
      meta,
    }
  }
}
