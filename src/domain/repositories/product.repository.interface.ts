import { Product } from "~/domain/entities/product.entity"
import { IProductWithVariants } from "~/domain/interfaces/product.interface"
import { PaginatedResult } from "~/domain/types/pagination.types"

export interface IProductRepository {
  create(product: Product): Promise<Product>
  
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

  update(product: Product): Promise<Product>
}
export const PRODUCT_REPOSITORY = Symbol('IProductRepository')

