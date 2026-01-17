import { ICommand } from '@nestjs/cqrs'
import { CreateBrandBodyDto } from '~/presentation/dtos/brand.dto'

export class CreateBrandCommand implements ICommand {
  constructor(
    public readonly body: CreateBrandBodyDto,
  ) {}
}
