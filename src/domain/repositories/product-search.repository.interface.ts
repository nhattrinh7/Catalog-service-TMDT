import { ProductSearchDocument } from '~/domain/interfaces/product.interface'

export interface IProductSearchRepository {
  indexProduct(product: ProductSearchDocument): Promise<void>
  updateProduct(id: string, product: Partial<ProductSearchDocument>): Promise<void>
  incrementBuyCount(productId: string, quantity: number): Promise<void>
  decrementBuyCount(productId: string, quantity: number): Promise<void>
  deleteProduct(id: string): Promise<void>
  bulkIndex(products: ProductSearchDocument[]): Promise<void>
}

export const PRODUCT_SEARCH_REPOSITORY = Symbol('IProductSearchRepository')
