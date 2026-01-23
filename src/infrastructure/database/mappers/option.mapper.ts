import { Option as PrismaOption } from '@prisma/client'
import { Option } from '~/domain/entities/option.entity'

export class OptionMapper {
  static toDomain(prismaOption: PrismaOption): Option {
    return new Option(
      prismaOption.id,
      prismaOption.name,
    )
  }

  static toPersistence(option: Option): PrismaOption {
    return {
      id: option.id,
      name: option.name,
    }
  }
}
