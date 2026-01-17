import { ProductVariant } from "~/domain/entities/product-variant.entity"

export interface IProductVariantRepository {
  createMany(productVariants: ProductVariant[]): Promise<void>
  updateMany(productVariants: ProductVariant[]): Promise<void>
  findByIds(ids: string[]): Promise<ProductVariant[]>
}
export const PRODUCT_VARIANT_REPOSITORY = Symbol('IProductVariantRepository')