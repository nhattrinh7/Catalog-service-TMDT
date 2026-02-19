import { Product } from '~/domain/entities/product.entity'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { ProductSearchDocument } from '~/domain/types/product-search.types'

export class ProductSearchMapper {
  static toElasticDocument(
    product: Product,
    variants: ProductVariant[],
    categoryName: string,
    categoryHierarchy: string[],
    buyCount: number,
    isInStock: boolean,
  ): ProductSearchDocument {
    // Tính giá thấp nhất và cao nhất từ các variants
    const prices = variants.map((v) => v.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    // Gộp tất cả SKU của variants thành chuỗi để search
    const skuText = variants.map((v) => v.sku).join(' ')

    return {
      id: product.id,
      shopId: product.shopId,
      sku: skuText,
      name: product.name,
      main_image: product.mainImage,
      description: product.descriptions,
      category: categoryName,
      category_hierarchy: categoryHierarchy,
      price: {
        min: minPrice,
        max: maxPrice,
      },
      ratingAvg: product.ratingAvg,
      buy_count: buyCount,
      is_in_stock: isInStock,
      attributes: (product.attributes as Record<string, unknown>) || {},
    }
  }
}
