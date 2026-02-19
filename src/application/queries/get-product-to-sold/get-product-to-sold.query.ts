import { IQuery } from '@nestjs/cqrs'

export class GetProductToSoldQuery implements IQuery {
  constructor(
    public readonly productId: string
  ) {}
}
