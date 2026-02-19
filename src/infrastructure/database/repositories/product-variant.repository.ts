import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { ProductVariantMapper } from '~/infrastructure/database/mappers/product-variant.mapper'

@Injectable()
export class ProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(productVariants: ProductVariant[], tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.productVariant.createMany({
      data: productVariants.map(variant => 
        ProductVariantMapper.toPersistence(variant)
      ),
    })
  }

  async updateMany(productVariants: ProductVariant[], tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    // Update từng variant vì Prisma không support updateMany với different data
    await Promise.all(
      productVariants.map(variant =>
        client.productVariant.update({
          where: { id: variant.id },
          data: ProductVariantMapper.toPersistence(variant),
        })
      )
    )
  }

  async findByIds(ids: string[]): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { 
        id: { in: ids },
        isDeleted: false,
      },
    })
    return variants.map(variant => ProductVariantMapper.toDomain(variant))
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { 
        productId,
        isDeleted: false,
      },
    })
    return variants.map(variant => ProductVariantMapper.toDomain(variant))
  }

  async softDeleteByIds(ids: string[], tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.productVariant.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
  }

  async findVariantWithProduct(variantId: string): Promise<any> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { 
        id: variantId,
        isDeleted: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            shopId: true,
          }
        }
      }
    })
    return variant
  }

  async findVariantsWithProductBatch(variantIds: string[]): Promise<any[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isDeleted: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            shopId: true,
            categoryId: true,
          },
        },
      },
    })
    return variants
  }
}
