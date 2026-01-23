import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { GetRootCategoriesQuery } from '~/application/queries/get-root-categories/get-root-categories.query'

export type RootCategory = { id: string; name: string }

@QueryHandler(GetRootCategoriesQuery)
export class GetRootCategoriesHandler implements IQueryHandler<GetRootCategoriesQuery, RootCategory[]> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<RootCategory[]> {
    const result = await this.categoryRepository.getRootCategories()

    return result
  }
}
