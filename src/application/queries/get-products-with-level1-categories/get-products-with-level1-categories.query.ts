import { IQuery } from '@nestjs/cqrs'

export class GetProductsWithLevel1CategoriesQuery implements IQuery {
  constructor(
    public readonly productIds: string[]
  ) {}
}
