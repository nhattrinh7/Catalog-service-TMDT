import { OptionValue as PrismaOptionValue } from '@prisma/client'
import { OptionValue } from '~/domain/entities/option-value.entity'

export class OptionValueMapper {
  static toDomain(prismaOptionValue: PrismaOptionValue): OptionValue {
    return new OptionValue(
      prismaOptionValue.id,
      prismaOptionValue.value,
      prismaOptionValue.optionId,
    )
  }

  static toPersistence(optionValue: OptionValue): PrismaOptionValue {
    return {
      id: optionValue.id,
      value: optionValue.value,
      optionId: optionValue.optionId,
    }
  }
}
