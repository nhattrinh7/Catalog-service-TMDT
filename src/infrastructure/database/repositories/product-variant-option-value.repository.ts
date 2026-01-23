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
}
