import { Brand } from '~/domain/entities/brand.entity'

export interface PaginatedBrandResult {
  items: Brand[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IBrandRepository {
  create(brand: Brand): Promise<void>
  findById(id: string): Promise<Brand | null>
  findPaginated(page: number, limit: number, search?: string): Promise<PaginatedBrandResult>
  update(brand: Brand): Promise<void>
  delete(id: string): Promise<void>
}
export const BRAND_REPOSITORY = Symbol('IBrandRepository')