import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Brand } from '~/domain/entities/brand.entity'
import { IBrandRepository, PaginatedBrandResult } from '~/domain/repositories/brand.repository.interface'

@Injectable()
export class BrandRepository implements IBrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(brand: Brand): Promise<void> { 
    await this.prisma.brand.create({ data: brand })
  }

  async findById(id: string): Promise<Brand | null> {
    const brand = await this.prisma.brand.findUnique({ where: { id } })
    if (!brand) return null

    return new Brand(
      brand.id,
      brand.name,
      brand.description,
      brand.logo,
      brand.country,
      brand.createdAt,
      brand.updatedAt,
    )
  }

  async findPaginated(page: number, limit: number, search?: string): Promise<PaginatedBrandResult> {
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { country: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.brand.count({ where }),
    ])

    const items = brands.map(
      (brand) =>
        new Brand(
          brand.id,
          brand.name,
          brand.description,
          brand.logo,
          brand.country,
          brand.createdAt,
          brand.updatedAt,
        ),
    )

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(brand: Brand): Promise<void> {
    await this.prisma.brand.update({
      where: { id: brand.id },
      data: {
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
        country: brand.country,
        updatedAt: brand.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.brand.delete({ where: { id } })
  }
}
