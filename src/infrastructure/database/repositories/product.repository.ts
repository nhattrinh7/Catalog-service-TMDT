import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Product } from '~/domain/entities/product.entity'
import { ProductMapper } from '~/infrastructure/database/mappers/product.mapper'
import { Prisma } from '@prisma/client'
import { PaginatedResult, calculatePaginationMeta } from '~/domain/types/pagination.types'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { snakeToCamelObject } from '~/common/utils/string.utils'
import { IProductWithVariants } from '~/domain/interfaces/product.interface'

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const productToCreate = ProductMapper.toPersistence(product)

    const createdProduct = await this.prisma.product.create({
      data: {
        ...productToCreate,
        attributes: productToCreate.attributes as Prisma.InputJsonValue,
        galleryImage: productToCreate.galleryImage as Prisma.InputJsonValue,
      },
    })

    return ProductMapper.toDomain(createdProduct)
  }

  async findPaginated(params: {
    page: number
    limit: number
    search?: string
    isActive?: boolean
    approveStatus?: string
    shopId: string // BẮT BUỘC
  }): Promise<PaginatedResult<Product>> {
    const { page, limit, search, isActive, approveStatus, shopId } = params

    // Tính offset cho pagination
    const offset = (page - 1) * limit

    // Xây dựng WHERE conditions và parameters
    const conditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    // Filter theo search với unaccent: search 'vay' sẽ tìm được 'váy'
    if (search) {
      conditions.push(`(
        unaccent(name) ILIKE unaccent($${paramIndex}) OR 
        unaccent(descriptions) ILIKE unaccent($${paramIndex + 1})
      )`)
      queryParams.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    // Filter theo isActive
    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`)
      queryParams.push(isActive)
      paramIndex++
    }

    // Filter theo approveStatus
    if (approveStatus) {
      conditions.push(`approve_status::text = $${paramIndex}`)
      queryParams.push(approveStatus)
      paramIndex++
    }

    // Filter theo shopId (BẮT BUỘC - luôn có)
    conditions.push(`shop_id = $${paramIndex}::uuid`)
    queryParams.push(shopId)
    paramIndex++

    // Tạo WHERE clause
    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : ''

    // Query products với raw SQL sử dụng unaccent
    const productsRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT p.*
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
      `,
      ...queryParams,
      limit,
      offset
    )

    // Count total với raw SQL
    const totalRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM products p ${whereClause}`,
      ...queryParams
    )
    const total = Number(totalRaw[0]?.count || 0)

    // Load variants cho mỗi product
    const productIds = productsRaw.map(p => p.id)
    const variants = productIds.length > 0
      ? await this.prisma.productVariant.findMany({
          where: { productId: { in: productIds } },
        })
      : []

    // Map variants theo productId
    const variantsByProductId = variants.reduce((acc, variant) => {
      if (!acc[variant.productId]) acc[variant.productId] = []
      acc[variant.productId].push(variant)
      return acc
    }, {} as Record<string, any[]>)

    // Map Prisma raw results sang Domain entities
    const items = productsRaw.map((prismaProduct) => {
      // Convert snake_case fields to camelCase
      const camelCaseProduct = snakeToCamelObject(prismaProduct)
      
      const product = ProductMapper.toDomain(camelCaseProduct)
      
      // Thêm variants vào product entity
      const productVariants = variantsByProductId[prismaProduct.id] || []
      ;(product as any).variants = productVariants.map((variant) => 
        new ProductVariant(
          variant.id,
          variant.productId,
          variant.sku,
          variant.price,
          variant.image,
          variant.createdAt,
          variant.updatedAt,
        )
      )

      return product
    })

    // Tính toán pagination metadata
    const meta = calculatePaginationMeta(total, page, limit)

    return {
      items,
      meta,
    }
  }

  async findPaginatedByCategoryIds(params: {
    page: number
    limit: number
    search?: string
    approveStatus?: string
    categoryIds: string[]
  }): Promise<PaginatedResult<Product>> {
    const { page, limit, search, approveStatus, categoryIds } = params

    // Nếu không có categoryIds thì trả về empty
    if (categoryIds.length === 0) {
      return {
        items: [],
        meta: calculatePaginationMeta(0, page, limit),
      }
    }

    // Tính offset cho pagination
    const offset = (page - 1) * limit

    // Xây dựng WHERE conditions và parameters
    const conditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    // Filter theo search với unaccent
    if (search) {
      conditions.push(`(
        unaccent(name) ILIKE unaccent($${paramIndex}) OR 
        unaccent(descriptions) ILIKE unaccent($${paramIndex + 1})
      )`)
      queryParams.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    // Filter theo approveStatus
    if (approveStatus) {
      conditions.push(`approve_status::text = $${paramIndex}`)
      queryParams.push(approveStatus)
      paramIndex++
    }

    // Filter theo categoryIds (IN clause)
    const placeholders = categoryIds.map((_, i) => `$${paramIndex + i}::uuid`).join(', ')
    conditions.push(`category_id IN (${placeholders})`)
    queryParams.push(...categoryIds)
    paramIndex += categoryIds.length

    // Tạo WHERE clause
    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : ''

    // Query products với raw SQL
    const productsRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT p.*
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
      `,
      ...queryParams,
      limit,
      offset
    )

    // Count total với raw SQL
    const totalRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM products p ${whereClause}`,
      ...queryParams
    )
    const total = Number(totalRaw[0]?.count || 0)

    // Load variants cho mỗi product
    const productIds = productsRaw.map(p => p.id)
    const variants = productIds.length > 0
      ? await this.prisma.productVariant.findMany({
          where: { productId: { in: productIds } },
        })
      : []

    // Map variants theo productId
    const variantsByProductId = variants.reduce((acc, variant) => {
      if (!acc[variant.productId]) acc[variant.productId] = []
      acc[variant.productId].push(variant)
      return acc
    }, {} as Record<string, any[]>)

    // Map Prisma raw results sang Domain entities
    const items = productsRaw.map((prismaProduct) => {
      const camelCaseProduct = snakeToCamelObject(prismaProduct)
      const product = ProductMapper.toDomain(camelCaseProduct)
      
      const productVariants = variantsByProductId[prismaProduct.id] || []
      ;(product as any).variants = productVariants.map((variant) => 
        new ProductVariant(
          variant.id,
          variant.productId,
          variant.sku,
          variant.price,
          variant.image,
          variant.createdAt,
          variant.updatedAt,
        )
      )

      return product
    })

    const meta = calculatePaginationMeta(total, page, limit)

    return {
      items,
      meta,
    }
  }

  async findByIdWithVariants(id: string): Promise<IProductWithVariants | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: { select: { name: true } } },
    })
    if (!product) return null

    // Map product entity
    const productEntity = ProductMapper.toDomain(product)
    
    // Map variants to domain entities
    const variantEntities = product.variants.map((variant) => 
      new ProductVariant(
        variant.id,
        variant.productId,
        variant.sku,
        variant.price,
        variant.image,
        variant.createdAt,
        variant.updatedAt,
      )
    )

    // Lấy category name
    const category = product.category.name
    
    // Return product with variants
    return {
      ...productEntity,
      variants: variantEntities,
      category: { name: category },
    } as IProductWithVariants
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) return null
    return ProductMapper.toDomain(product)
  }

  async update(product: Product): Promise<Product> {
    const productToUpdate = ProductMapper.toPersistence(product)
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...productToUpdate,
        attributes: productToUpdate.attributes as Prisma.InputJsonValue,
        galleryImage: productToUpdate.galleryImage as Prisma.InputJsonValue,
      },
    })
    return ProductMapper.toDomain(updatedProduct)
  }
}
