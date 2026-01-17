import { Product as PrismaProduct } from '@prisma/client'
import { Product } from '~/domain/entities/product.entity'

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): Product {
    return new Product(
      prismaProduct.id,
      prismaProduct.name,
      prismaProduct.descriptions,
      prismaProduct.attributes,
      prismaProduct.shopId,
      prismaProduct.categoryId,
      prismaProduct.mainImage,
      prismaProduct.galleryImage,
      prismaProduct.video,
      prismaProduct.ratingAvg,
      prismaProduct.ratingCount,
      prismaProduct.unit,
      prismaProduct.isActive,
      prismaProduct.approveStatus,
      prismaProduct.rejectReason,
      prismaProduct.createdAt,
      prismaProduct.updatedAt,
    )
  }

  static toPersistence(product: Product): PrismaProduct {
    return {
      id: product.id,
      name: product.name,       
      descriptions: product.descriptions,
      attributes: product.attributes,
      shopId: product.shopId,
      categoryId: product.categoryId,
      mainImage: product.mainImage,
      galleryImage: product.galleryImage,
      video: product.video,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      unit: product.unit,
      isActive: product.isActive,
      approveStatus: product.approveStatus,
      rejectReason: product.rejectReason,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}