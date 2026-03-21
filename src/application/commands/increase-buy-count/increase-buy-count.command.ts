import { ICommand } from '@nestjs/cqrs'

export class IncreaseBuyCountCommand implements ICommand {
  constructor(
    public readonly items: Array<{ productId: string; quantity: number }>,
  ) {}
}
