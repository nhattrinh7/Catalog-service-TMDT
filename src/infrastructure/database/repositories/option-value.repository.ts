import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IOptionValueRepository } from '~/domain/repositories/option-value.repository.interface'
import { OptionValue } from '~/domain/entities/option-value.entity'
import { OptionValueMapper } from '~/infrastructure/database/mappers/option-value.mapper'

@Injectable()
export class OptionValueRepository implements IOptionValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(optionValues: OptionValue[]): Promise<OptionValue[]> {
    const createdOptionValues = await Promise.all(
      optionValues.map(optionValue =>
        this.prisma.optionValue.create({
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
}
