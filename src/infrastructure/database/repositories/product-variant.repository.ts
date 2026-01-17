import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IProductVariantRepository } from '~/domain/repositories/product-variant.repository.interface'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { ProductVariantMapper } from '~/infrastructure/database/mappers/product-variant.mapper'

@Injectable()
export class ProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(productVariants: ProductVariant[]): Promise<void> {
    await this.prisma.productVariant.createMany({
      data: productVariants.map(variant => 
        ProductVariantMapper.toPersistence(variant)
      ),
    })
  }

  async updateMany(productVariants: ProductVariant[]): Promise<void> {
    // Update từng variant vì Prisma không support updateMany với different data
    await Promise.all(
      productVariants.map(variant =>
        this.prisma.productVariant.update({
          where: { id: variant.id },
          data: ProductVariantMapper.toPersistence(variant),
        })
      )
    )
  }

  async findByIds(ids: string[]): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: ids } },
    })
    return variants.map(variant => ProductVariantMapper.toDomain(variant))
  }
}
