import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetDescendantCategoryIdsQuery } from './get-descendant-category-ids.query'
import type { ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { CATEGORY_REPOSITORY } from '~/domain/repositories/category.repository.interface'

@QueryHandler(GetDescendantCategoryIdsQuery)
export class GetDescendantCategoryIdsHandler implements IQueryHandler<GetDescendantCategoryIdsQuery, string[]> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetDescendantCategoryIdsQuery): Promise<string[]> {
    const { categoryIds } = query
    return this.categoryRepository.findAllDescendantIds(categoryIds)
  }
}
