import { Product } from "~/domain/entities/product.entity"
import { ProductVariant } from "~/domain/entities/product-variant.entity"

export interface IProductWithVariants extends Product {
  variants: ProductVariant[]
  category: { name: string }
}

export interface IProductVariantWithStock extends ProductVariant {
  stock: number
  soldQuantity: number
}

export interface IProductWithVariantsAndStock extends Product {
  variants: IProductVariantWithStock[]
  category: { name: string }
}