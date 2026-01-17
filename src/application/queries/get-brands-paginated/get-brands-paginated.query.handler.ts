import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetBrandsPaginatedQuery } from '~/application/queries/get-brands-paginated/get-brands-paginated.query'
import { BRAND_REPOSITORY, type IBrandRepository } from '~/domain/repositories/brand.repository.interface'
import { Brand } from '~/domain/entities/brand.entity'

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetBrandsPaginatedResult {
  brands: Brand[]
  meta: PaginationMeta
}

@QueryHandler(GetBrandsPaginatedQuery)
export class GetBrandsPaginatedHandler implements IQueryHandler<GetBrandsPaginatedQuery, GetBrandsPaginatedResult> {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(query: GetBrandsPaginatedQuery): Promise<GetBrandsPaginatedResult> {
    const { page, limit, search } = query

    const result = await this.brandRepository.findPaginated(page, limit, search)

    return {
      brands: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    }
  }
}

