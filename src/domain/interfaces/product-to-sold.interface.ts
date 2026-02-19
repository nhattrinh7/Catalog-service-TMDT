export interface IProductVariantToSold {
  id: string
  sku: string
  price: number
  image: string
  stock: number
}

export interface IShopInfo {
  id: string
  name: string
  logo: string | null
  productCount: number
  createdAt: Date
}

export interface IProductToSold {
  id: string
  name: string
  description: string
  attributes: any
  mainImage: string
  galleryImage: any
  video: string | null
  ratingAvg: number
  ratingCount: number
  unit: string
  soldQuantity: number
  availableQuantity: number
  variants: IProductVariantToSold[]
  shop: IShopInfo
}
