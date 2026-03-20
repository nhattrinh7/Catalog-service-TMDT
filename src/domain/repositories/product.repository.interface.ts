import { Product } from "~/domain/entities/product.entity"
import { ProductReview } from "~/domain/entities/product-review.entity"
import { IProductWithVariants } from "~/domain/interfaces/product.interface"
import { PaginatedResult } from "~/domain/types/pagination.types"

export interface ProductWithLevel1Category {
  productId: string
  categoryId: string
  level1CategoryId: string
}

export interface IProductRepository {
  create(product: Product, tx?: any): Promise<Product>
  
  findPaginated(params: {
    page: number
    limit: number
    search?: string
    isActive?: boolean
    approveStatus?: string
    shopId: string // BẮT BUỘC
  }): Promise<PaginatedResult<Product>>

  findPaginatedByCategoryIds(params: {
    page: number
    limit: number
    search?: string
    approveStatus?: string
    categoryIds: string[]
  }): Promise<PaginatedResult<Product>>

  findByIdWithVariants(id: string): Promise<IProductWithVariants | null>

  findById(id: string): Promise<Product | null>

  update(product: Product, tx?: any): Promise<Product>

  // Lấy reviews của product
  findReviewsPaginated(params: {
    productId: string
    page: number
    limit: number
    rating?: string
    hasMedia?: boolean
  }): Promise<PaginatedResult<ProductReview>>

  createReview(review: ProductReview, tx?: any): Promise<ProductReview>

  updateRating(productId: string, ratingAvg: number, ratingCount: number, tx?: any): Promise<void>

  countProductAmountByShopId(shopId: string): Promise<number>

  findProductsWithLevel1Categories(productIds: string[]): Promise<ProductWithLevel1Category[]>

  findReviewedOrderItems(params: {
    items: Array<{ orderId: string; productId: string }>
  }): Promise<Array<{ orderId: string; productId: string }>>
}
export const PRODUCT_REPOSITORY = Symbol('IProductRepository')


