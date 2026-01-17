
import { Brand as PrismaBrand } from '@prisma/client'
import { Brand } from '~/domain/entities/brand.entity'

export class BrandMapper {
  static toDomain(prismaBrand: PrismaBrand): Brand {
    return new Brand(
      prismaBrand.id,
      prismaBrand.name,
      prismaBrand.description,
      prismaBrand.logo,
      prismaBrand.country,
      prismaBrand.createdAt,
      prismaBrand.updatedAt,
    )
  }

  static toPersistence(brand: Brand): PrismaBrand {
    return {
      id: brand.id,
      name: brand.name,       
      description: brand.description,
      logo: brand.logo,
      country: brand.country,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }
  }
}