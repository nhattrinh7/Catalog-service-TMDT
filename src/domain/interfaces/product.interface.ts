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

export interface IClassification {
  name: string
  values: string[]
}

export interface IProductWithVariantsAndClassifications extends IProductWithVariantsAndStock {
  classifications: IClassification[]
}

export interface ProductSearchDocument {
  id: string
  shopId: string
  sku: string
  name: string
  main_image: string
  description: string
  category: string
  category_hierarchy: string[]
  price: {
    min: number
    max: number
  }
  ratingAvg: number
  buy_count: number
  is_in_stock: boolean
  attributes: Record<string, unknown>
}