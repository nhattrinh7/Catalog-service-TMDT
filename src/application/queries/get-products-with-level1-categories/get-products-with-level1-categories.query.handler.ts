import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetProductsWithLevel1CategoriesQuery } from './get-products-with-level1-categories.query'
import { PRODUCT_REPOSITORY, type IProductRepository, type ProductWithLevel1Category } from '~/domain/repositories/product.repository.interface'

@QueryHandler(GetProductsWithLevel1CategoriesQuery)
export class GetProductsWithLevel1CategoriesHandler implements IQueryHandler<GetProductsWithLevel1CategoriesQuery, ProductWithLevel1Category[]> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsWithLevel1CategoriesQuery): Promise<ProductWithLevel1Category[]> {
    const { productIds } = query

    // Gọi repository để lấy products với level1CategoryIds
    return await this.productRepository.findProductsWithLevel1Categories(productIds)
  }
}
