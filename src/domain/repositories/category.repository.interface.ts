import { Category } from '~/domain/entities/category.entity'

export interface ICategoryRepository {
  create(category: Category): Promise<Category>
  getCategories(): Promise<Category[] | null>
  getCategory(id: string): Promise<Category | null>
}
export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository')