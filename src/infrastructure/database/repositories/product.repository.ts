import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IProductRepository, ProductWithLevel1Category, type ReportedReviewItem } from '~/domain/repositories/product.repository.interface'
import { ReviewReportReason } from '~/domain/enums/review-report.enum'
import { Product } from '~/domain/entities/product.entity'
import { ProductReview } from '~/domain/entities/product-review.entity'
import { ProductMapper } from '~/infrastructure/database/mappers/product.mapper'
import { ProductReviewMapper } from '~/infrastructure/database/mappers/product-review.mapper'
import { Prisma } from '@prisma/client'
import { PaginatedResult, calculatePaginationMeta } from '~/domain/types/pagination.types'
import { ProductVariant } from '~/domain/entities/product-variant.entity'
import { snakeToCamelObject } from '~/common/utils/string.utils'
import { IProductWithVariants } from '~/domain/interfaces/product.interface'

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product, tx?: any): Promise<Product> {
    const client = tx ?? this.prisma
    const productToCreate = ProductMapper.toPersistence(product)

    const createdProduct = await client.product.create({
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
    shopId: string
  }): Promise<PaginatedResult<Product>> {
    const { page, limit, search, isActive, approveStatus, shopId } = params

    const offset = (page - 1) * limit

    const conditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

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

    conditions.push(`shop_id = $${paramIndex}::uuid`)
    queryParams.push(shopId)
    paramIndex++

    conditions.push(`is_deleted = false`)

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : ''

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

    const totalRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM products p ${whereClause}`,
      ...queryParams
    )
    const total = Number(totalRaw[0]?.count || 0)

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

  async findPaginatedByCategoryIds(params: {
    page: number
    limit: number
    search?: string
    approveStatus?: string
    categoryIds: string[]
  }): Promise<PaginatedResult<Product>> {
    const { page, limit, search, approveStatus, categoryIds } = params

    if (categoryIds.length === 0) {
      return {
        items: [],
        meta: calculatePaginationMeta(0, page, limit),
      }
    }

    const offset = (page - 1) * limit

    const conditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

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

    conditions.push(`is_deleted = false`)

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : ''

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

    const totalRaw = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM products p ${whereClause}`,
      ...queryParams
    )
    const total = Number(totalRaw[0]?.count || 0)

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
    const product = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
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

    const category = product.category.name
    
    // Return product with variants
    return {
      ...productEntity,
      variants: variantEntities,
      category: { name: category },
    } as IProductWithVariants
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({ 
      where: { id, isDeleted: false } 
    })
    if (!product) return null
    return ProductMapper.toDomain(product)
  }

  async update(product: Product, tx?: any): Promise<Product> {
    const client = tx ?? this.prisma
    const productToUpdate = ProductMapper.toPersistence(product)
    const updatedProduct = await client.product.update({
      where: { id: product.id },
      data: {
        ...productToUpdate,
        attributes: productToUpdate.attributes as Prisma.InputJsonValue,
        galleryImage: productToUpdate.galleryImage as Prisma.InputJsonValue,
      },
    })
    return ProductMapper.toDomain(updatedProduct)
  }

  async findReviewsPaginated(params: {
    productId: string
    page: number
    limit: number
    rating?: string
    hasMedia?: boolean
  }): Promise<PaginatedResult<ProductReview>> {
    const { productId, page, limit, rating, hasMedia } = params

    // Build where clause
    const where: any = {
      productId,
    }

    if (rating) {
      where.rating = parseInt(rating, 10)
    }

    if (hasMedia !== undefined) {
      if (hasMedia) {
        where.OR = [
          { images: { not: Prisma.DbNull } },
          { video: { not: null } },
        ]
      } else {
        where.images = { equals: Prisma.DbNull }
        where.video = { equals: null }
      }
    }

    const total = await this.prisma.productReview.count({ where })

    const prismaReviews = await this.prisma.productReview.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
      },
    })

    const items = ProductReviewMapper.toDomainArray(prismaReviews)

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findShopReviewsPaginated(params: {
    shopId: string
    page: number
    limit: number
    ratings?: number[]
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResult<ProductReview>> {
    const { shopId, page, limit, ratings, search, startDate, endDate } = params

    const where: Prisma.ProductReviewWhereInput = {
      shopId,
    }

    if (ratings && ratings.length > 0) {
      where.rating = { in: ratings }
    }

    if (search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(search)

      where.OR = [
        ...(isUuid ? [{ orderId: { equals: search } }] : []),
        { productName: { contains: search, mode: 'insensitive' } },
        { buyerUsername: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      const createdAt: Prisma.DateTimeFilter = {}
      if (startDate) createdAt.gte = new Date(`${startDate}T00:00:00`)
      if (endDate) createdAt.lte = new Date(`${endDate}T23:59:59.999`)
      where.createdAt = createdAt
    }

    const total = await this.prisma.productReview.count({ where })

    const prismaReviews = await this.prisma.productReview.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const items = ProductReviewMapper.toDomainArray(prismaReviews)

    return {
      items,
      meta: calculatePaginationMeta(total, page, limit),
    }
  }

  async findReviewById(reviewId: string): Promise<{ id: string; shopId: string } | null> {
    return await this.prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true, shopId: true },
    })
  }

  async findReportedReviewsPaginated(params: {
    page: number
    limit: number
    isHidden?: boolean
  }): Promise<PaginatedResult<ReportedReviewItem>> {
    const { page, limit, isHidden } = params

    const where: Prisma.ProductReviewWhereInput = {
      isHidden: typeof isHidden === 'boolean' ? isHidden : false,
      reports: {
        some: {},
      },
    }

    const total = await this.prisma.productReview.count({ where })

    const prismaReviews = await this.prisma.productReview.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const items: ReportedReviewItem[] = prismaReviews
      .map((review) => {
        const report = review.reports[0]
        if (!report) return null

        const images = Array.isArray(review.images) ? (review.images as string[]) : []

        return {
          id: review.id,
          buyerUsername: review.buyerUsername,
          buyerAvatar: review.buyerAvatar,
          productName: review.productName,
          productImage: review.productImage,
          sku: review.sku,
          rating: review.rating,
          images,
          video: review.video,
          createdAt: review.createdAt,
          report: {
            reporterUsername: report.reporterUsername,
            reporterAvatar: report.reporterAvatar,
            reason: report.reason as ReviewReportReason,
            description: report.description,
            createdAt: report.createdAt,
          },
        }
      })
      .filter((item): item is ReportedReviewItem => item !== null)

    return {
      items,
      meta: calculatePaginationMeta(total, page, limit),
    }
  }

  async hideReview(reviewId: string, hiddenReason?: string | null, hiddenAt?: Date | null, tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.productReview.update({
      where: { id: reviewId },
      data: {
        isHidden: true,
        hiddenReason: hiddenReason ?? null,
        hiddenAt: hiddenAt ?? new Date(),
      },
    })
  }

  async existsReviewByOrderAndProduct(params: {
    orderId: string
    productId: string
  }): Promise<boolean> {
    const review = await this.prisma.productReview.findUnique({
      where: {
        orderId_productId: {
          orderId: params.orderId,
          productId: params.productId,
        },
      },
      select: { id: true },
    })

    return !!review
  }

  async findReviewedOrderItems(params: {
    items: Array<{ orderId: string; productId: string }>
  }): Promise<Array<{ orderId: string; productId: string }>> {
    const { items } = params
    if (items.length === 0) return []

    const reviews = await this.prisma.productReview.findMany({
      where: {
        OR: items.map((item) => ({
          orderId: item.orderId,
          productId: item.productId,
        })),
      },
      select: {
        orderId: true,
        productId: true,
      },
    })

    const unique = new Map<string, { orderId: string; productId: string }>()
    for (const review of reviews) {
      const key = `${review.orderId}:${review.productId}`
      if (!unique.has(key)) {
        unique.set(key, { orderId: review.orderId, productId: review.productId })
      }
    }

    return Array.from(unique.values())
  }

  async countProductAmountByShopId(shopId: string): Promise<number> {
    return await this.prisma.product.count({
      where: {
        shopId,
        isDeleted: false,
        approveStatus: 'ACCEPTED',
      },
    })
  }

  async findProductsWithLevel1Categories(productIds: string[]): Promise<ProductWithLevel1Category[]> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
      },
      select: {
        id: true,
        categoryId: true,
      },
    })

    const results: ProductWithLevel1Category[] = []

    for (const product of products) {
      const level1CategoryId = await this.findLevel1CategoryId(product.categoryId)
      
      results.push({
        productId: product.id,
        categoryId: product.categoryId,
        level1CategoryId,
      })
    }

    return results
  }

  private async findLevel1CategoryId(categoryId: string): Promise<string> {
    let currentCategoryId = categoryId

    while (true) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentCategoryId },
        select: { id: true, parentId: true },
      })

      if (!category) {
        throw new NotFoundException(`Category not found: ${currentCategoryId}`)
      }

      if (category.parentId === null) {
        return category.id
      }

      currentCategoryId = category.parentId
    }
  }

  async createReview(review: ProductReview, tx?: any): Promise<ProductReview> {
    const client = tx ?? this.prisma
    const data = ProductReviewMapper.toPersistence(review)

    const created = await client.productReview.create({ data })

    return ProductReviewMapper.toDomain(created)
  }

  async updateRating(productId: string, ratingAvg: number, ratingCount: number, tx?: any): Promise<void> {
    const client = tx ?? this.prisma

    await client.product.update({
      where: { id: productId },
      data: {
        ratingAvg,
        ratingCount,
      },
    })
  }
}

