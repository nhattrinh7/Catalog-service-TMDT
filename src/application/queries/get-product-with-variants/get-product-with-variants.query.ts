import { IQuery } from '@nestjs/cqrs'

export class GetProductWithVariantsQuery implements IQuery {
  constructor(
    public readonly id: string,
  ) {}
}
