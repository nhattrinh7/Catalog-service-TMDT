import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IProductVariantOptionValueRepository } from '~/domain/repositories/product-variant-option-value.repository.interface'

@Injectable()
export class ProductVariantOptionValueRepository implements IProductVariantOptionValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(data: { variantId: string; optionValueId: string }[]): Promise<void> {
    await this.prisma.productVariantOptionValue.createMany({
      data: data.map(item => ({
        variantId: item.variantId,
        optionValueId: item.optionValueId,
      })),
    })
  }

  async findByVariantIds(variantIds: string[]): Promise<{ variantId: string; optionValue: { id: string; value: string; option: { id: string; name: string } } }[]> {
    const results = await this.prisma.productVariantOptionValue.findMany({
      where: { variantId: { in: variantIds } },
      select: {
        variantId: true,
        optionValue: {
          select: {
            id: true,
            value: true,
            option: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
    return results
  }

  async deleteByVariantIds(variantIds: string[]): Promise<void> {
    await this.prisma.productVariantOptionValue.deleteMany({
      where: { variantId: { in: variantIds } },
    })
  }

  async deleteByOptionValueIds(optionValueIds: string[]): Promise<void> {
    await this.prisma.productVariantOptionValue.deleteMany({
      where: { optionValueId: { in: optionValueIds } },
    })
  }
}
