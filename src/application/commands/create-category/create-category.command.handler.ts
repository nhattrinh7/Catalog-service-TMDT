import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateCategoryCommand } from '~/application/commands/create-category/create-category.command'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { Category } from '~/domain/entities/category.entity'

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand, Category> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand) {
    const { body } = command

    const category = Category.create({
      name: body.name,
      description: body.description,
      parentId: body.parentId,
      attributes: body.attributes,
    })

    // Tạo category rồi thì lưu lại
    const newCategory = await this.categoryRepository.create(category)
    return newCategory
  }
}
  