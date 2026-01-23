import { ICommand } from '@nestjs/cqrs'

export class UnhideProductCommand implements ICommand {
  constructor(
    public readonly id: string,
  ) {}
}
