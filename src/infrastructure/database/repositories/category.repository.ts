import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Category } from '~/domain/entities/category.entity'
import { ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { CategoryMapper } from '~/infrastructure/database/mappers/category.mapper'
import { Prisma } from '@prisma/client'

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> { 
    const categoryToCreate = CategoryMapper.toPersistence(category)
    
    const createdCategory = await this.prisma.category.create({
      data: {
        id: categoryToCreate.id,
        name: categoryToCreate.name,
        description: categoryToCreate.description,
        parentId: categoryToCreate.parentId,
        attributes: categoryToCreate.attributes as Prisma.InputJsonValue,
        createdAt: categoryToCreate.createdAt,
        updatedAt: categoryToCreate.updatedAt,
      }
    })
    
    return CategoryMapper.toDomain(createdCategory)
  }

  async getCategories(): Promise<Category[] | null> {
    const categories = await this.prisma.category.findMany()
    if (!categories) return null
    
    return categories.map(category => CategoryMapper.toDomain(category))
  }

  async getCategory(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) return null
    
    return CategoryMapper.toDomain(category)
  }
}
