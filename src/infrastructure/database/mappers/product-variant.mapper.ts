import { ProductVariant as PrismaProductVariant } from '@prisma/client'
import { ProductVariant } from '~/domain/entities/product-variant.entity'

export class ProductVariantMapper {
  static toDomain(prismaProductVariant: PrismaProductVariant): ProductVariant {
    return new ProductVariant(
      prismaProductVariant.id,
      prismaProductVariant.productId,
      prismaProductVariant.sku,
      prismaProductVariant.price,
      prismaProductVariant.image,
      prismaProductVariant.createdAt,
      prismaProductVariant.updatedAt,
      prismaProductVariant.isDeleted,
    )
  }

  static toPersistence(productVariant: ProductVariant): PrismaProductVariant {
    return {
      id: productVariant.id,
      productId: productVariant.productId,
      sku: productVariant.sku,
      price: productVariant.price,
      image: productVariant.image,
      createdAt: productVariant.createdAt,
      updatedAt: productVariant.updatedAt,
      isDeleted: productVariant.isDeleted,
    }
  }
}