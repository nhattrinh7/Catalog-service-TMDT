import { ICommand } from '@nestjs/cqrs'
import { CreateCategoryBodyDto } from '~/presentation/dtos/category.dto'

export class CreateCategoryCommand implements ICommand {
  constructor(
    public readonly body: CreateCategoryBodyDto,
  ) {}
}
  