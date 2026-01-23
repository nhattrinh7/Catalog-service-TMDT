import { Category } from '~/domain/entities/category.entity'

export interface ICategoryRepository {
  create(category: Category): Promise<Category>
  getCategories(): Promise<Category[] | null>
  getCategory(id: string): Promise<Category | null>
  getRootCategories(): Promise<{ id: string; name: string }[]>
}
export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository')