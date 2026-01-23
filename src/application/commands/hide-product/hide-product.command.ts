import { ICommand } from '@nestjs/cqrs'

export class HideProductCommand implements ICommand {
  constructor(
    public readonly id: string,
  ) {}
}
