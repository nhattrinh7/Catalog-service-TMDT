import { ICommand } from '@nestjs/cqrs'

export class ApproveProductCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly roleCategoryIds: string[],
  ) {}
}
