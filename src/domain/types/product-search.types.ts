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
