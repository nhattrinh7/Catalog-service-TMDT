import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { GetCategoriesQuery } from '~/application/queries/get-categories/get-categories.query'
import { Category } from '~/domain/entities/category.entity'

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery, Category[] | null> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[] | null> {

    const result = await this.categoryRepository.getCategories()

    return result
  }
}