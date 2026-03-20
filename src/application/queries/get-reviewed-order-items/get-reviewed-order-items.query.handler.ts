import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetReviewedOrderItemsQuery } from './get-reviewed-order-items.query'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'

@QueryHandler(GetReviewedOrderItemsQuery)
export class GetReviewedOrderItemsHandler implements IQueryHandler<GetReviewedOrderItemsQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetReviewedOrderItemsQuery) {
    const { items } = query
    if (!items || items.length === 0) return []

    return this.productRepository.findReviewedOrderItems({
      items,
    })
  }
}
