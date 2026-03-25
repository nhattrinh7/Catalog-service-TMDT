import { Category } from '~/domain/entities/category.entity'

export interface ICategoryRepository {
  create(category: Category): Promise<Category>
  getCategories(): Promise<Category[] | null>
  getCategory(id: string): Promise<Category | null>
  getRootCategories(): Promise<{ id: string; name: string }[]>
  getCategoryHierarchy(categoryId: string): Promise<string[]>
  findRootCategoryId(categoryId: string): Promise<string | null>
  findAllDescendantIds(parentIds: string[]): Promise<string[]>
}
export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository')