import { ICommand } from '@nestjs/cqrs'
import { CreateProductBodyDto } from '~/presentation/dtos/product.dto'

export class CreateProductCommand  implements ICommand {
  constructor(
    public readonly body: CreateProductBodyDto,
  ) {}
}
  