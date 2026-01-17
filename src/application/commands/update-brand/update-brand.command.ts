import { ICommand } from '@nestjs/cqrs'
import { UpdateBrandBodyDto } from '~/presentation/dtos/brand.dto'

export class UpdateBrandCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly body: UpdateBrandBodyDto,
  ) {}
}
