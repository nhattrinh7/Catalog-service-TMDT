import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IOptionRepository } from '~/domain/repositories/option.repository.interface'
import { Option } from '~/domain/entities/option.entity'
import { OptionMapper } from '~/infrastructure/database/mappers/option.mapper'

@Injectable()
export class OptionRepository implements IOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(option: Option): Promise<Option> {
    const createdOption = await this.prisma.option.create({
      data: OptionMapper.toPersistence(option),
    })
    return OptionMapper.toDomain(createdOption)
  }

  async findByName(name: string): Promise<Option | null> {
    const option = await this.prisma.option.findFirst({
      where: { name },
    })
    return option ? OptionMapper.toDomain(option) : null
  }

  async findByProductId(productId: string): Promise<Option[]> {
    // Tìm options của product thông qua join:
    // product → product_variants → product_variant_option_values → option_values → options
    const options = await this.prisma.option.findMany({
      where: {
        optionValues: {
          some: {
            productVariantOptionValues: {
              some: {
                variant: {
                  productId,
                  isDeleted: false,
                },
              },
            },
          },
        },
      },
      distinct: ['id'], // Loại bỏ duplicate
    })
    return options.map(option => OptionMapper.toDomain(option))
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.prisma.option.deleteMany({
      where: { id: { in: ids } },
    })
  }
}
