import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateCategoryCommand } from '~/application/commands/create-category/create-category.command'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '~/domain/repositories/category.repository.interface'
import { Inject } from '@nestjs/common'
import { Category } from '~/domain/entities/category.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CACHE_EVENT, CACHE_RESOURCE, CACHE_TYPE } from '~/common/constants/cache.constant'

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand, Category> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventEmitter: EventEmitter2,
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

    // Invalidate cache categories
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.LIST, resource: CACHE_RESOURCE.CATEGORIES })
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.LIST, resource: CACHE_RESOURCE.CATEGORIES_ROOT })

    return newCategory
  }
}
  