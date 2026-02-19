import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IOptionValueRepository } from '~/domain/repositories/option-value.repository.interface'
import { OptionValue } from '~/domain/entities/option-value.entity'
import { OptionValueMapper } from '~/infrastructure/database/mappers/option-value.mapper'

@Injectable()
export class OptionValueRepository implements IOptionValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(optionValues: OptionValue[], tx?: any): Promise<OptionValue[]> {
    const client = tx ?? this.prisma
    const createdOptionValues = await Promise.all(
      optionValues.map(optionValue =>
        client.optionValue.create({
          data: OptionValueMapper.toPersistence(optionValue),
        })
      )
    )
    return createdOptionValues.map(ov => OptionValueMapper.toDomain(ov))
  }

  async findByValues(values: string[]): Promise<OptionValue[]> {
    const optionValues = await this.prisma.optionValue.findMany({
      where: { value: { in: values } },
    })
    return optionValues.map(ov => OptionValueMapper.toDomain(ov))
  }

  async findByOptionIds(optionIds: string[]): Promise<OptionValue[]> {
    const optionValues = await this.prisma.optionValue.findMany({
      where: { optionId: { in: optionIds } },
    })
    return optionValues.map(ov => OptionValueMapper.toDomain(ov))
  }

  async deleteByIds(ids: string[], tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.optionValue.deleteMany({
      where: { id: { in: ids } },
    })
  }
}
