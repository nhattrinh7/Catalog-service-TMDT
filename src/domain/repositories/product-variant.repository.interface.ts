import { ProductVariant } from "~/domain/entities/product-variant.entity"

export interface IProductVariantRepository {
  createMany(productVariants: ProductVariant[], tx?: any): Promise<void>
  updateMany(productVariants: ProductVariant[], tx?: any): Promise<void>
  findByIds(ids: string[]): Promise<ProductVariant[]>
  findByProductId(productId: string): Promise<ProductVariant[]>
  softDeleteByIds(ids: string[], tx?: any): Promise<void>
  findVariantWithProduct(variantId: string): Promise<any>
  findVariantsWithProductBatch(variantIds: string[]): Promise<any[]>
}
export const PRODUCT_VARIANT_REPOSITORY = Symbol('IProductVariantRepository')