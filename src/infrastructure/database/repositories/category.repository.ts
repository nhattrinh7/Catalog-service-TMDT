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
        // Nếu attributes là null thì gán là giá trị NULL trong database, nếu chỉ dùng Prisma.InputJsonValue
        // thì giá trị trường attributes trong database sẽ là chuỗi 'null' thay vì giá trị NULL
        attributes: categoryToCreate.attributes === null 
          ? Prisma.DbNull
          : categoryToCreate.attributes as Prisma.InputJsonValue,
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

  async getRootCategories(): Promise<{ id: string; name: string }[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true },
    })
    
    return categories
  }

  async getCategoryHierarchy(categoryId: string): Promise<string[]> {
    const hierarchy: string[] = []
    let currentId: string | null = categoryId

    while (currentId) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { name: true, parentId: true },
      })

      if (!category) break

      hierarchy.push(category.name)
      currentId = category.parentId
    }

    return hierarchy
  }

  /**
   * Tìm root category (cấp 1) từ bất kỳ categoryId nào (kể cả lá)
   * Traverse ngược lên parent cho đến khi tìm được category có parentId = null
   */
  async findRootCategoryId(categoryId: string): Promise<string | null> {
    let currentId: string | null = categoryId

    while (currentId) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { id: true, parentId: true },
      })

      if (!category) return null

      // Nếu không có parent → đây là root category
      if (!category.parentId) return category.id

      currentId = category.parentId
    }

    return null
  }

  // Lấy tất cả categoryId con/cháu từ danh sách parentIds (bao gồm chính parentIds)
  async findAllDescendantIds(parentIds: string[]): Promise<string[]> {
    if (parentIds.length === 0) return []

    const allIds = new Set<string>(parentIds)
    let currentLevelIds = [...parentIds]

    // BFS: tìm con ở mỗi cấp cho đến khi không còn con nào
    while (currentLevelIds.length > 0) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: currentLevelIds } },
        select: { id: true },
      })

      currentLevelIds = []
      for (const child of children) {
        if (!allIds.has(child.id)) {
          allIds.add(child.id)
          currentLevelIds.push(child.id)
        }
      }
    }

    return Array.from(allIds)
  }
}
