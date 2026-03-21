import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetReportedReviewsPaginatedQuery } from '~/application/queries/get-reported-reviews-paginated/get-reported-reviews-paginated.query'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'

@QueryHandler(GetReportedReviewsPaginatedQuery)
export class GetReportedReviewsPaginatedHandler implements IQueryHandler<GetReportedReviewsPaginatedQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetReportedReviewsPaginatedQuery) {
    const { page, limit, isHidden } = query
    return this.productRepository.findReportedReviewsPaginated({ page, limit, isHidden })
  }
}
