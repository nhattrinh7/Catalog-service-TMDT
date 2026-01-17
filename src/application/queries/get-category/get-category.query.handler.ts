import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { GetCategoryQuery } from '~/application/queries/get-category/get-category.query'
import { Category } from '~/domain/entities/category.entity'

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery, Category | null> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoryQuery): Promise<Category | null> {
    const { id } = query

    const result = await this.categoryRepository.getCategory(id)

    return result
  }
}