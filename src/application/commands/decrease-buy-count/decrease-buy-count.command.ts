import { ICommand } from '@nestjs/cqrs'

export class DecreaseBuyCountCommand implements ICommand {
  constructor(
    public readonly items: Array<{ productId: string; quantity: number }>,
  ) {}
}
