import { Category as PrismaBrand } from '@prisma/client'
import { Category } from '~/domain/entities/category.entity'

export class CategoryMapper {
  static toDomain(prismaBrand: PrismaBrand): Category {
    return new Category(
      prismaBrand.id,
      prismaBrand.name,
      prismaBrand.description,
      prismaBrand.parentId,
      prismaBrand.attributes,
      prismaBrand.createdAt,
      prismaBrand.updatedAt,
    )
  }

  static toPersistence(category: Category): PrismaBrand {
    return {
      id: category.id,
      name: category.name,       
      description: category.description,
      parentId: category.parentId,
      attributes: category.attributes,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }
}