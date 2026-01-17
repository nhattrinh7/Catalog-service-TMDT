import { ICommand } from '@nestjs/cqrs'
import { UpdateProductBodyDto } from '~/presentation/dtos/product.dto'

export class UpdateProductCommand  implements ICommand {
  constructor(
    public readonly id: string,
    public readonly body: UpdateProductBodyDto,
  ) {}
}
  