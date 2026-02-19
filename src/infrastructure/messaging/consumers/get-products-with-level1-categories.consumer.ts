import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetProductsWithLevel1CategoriesQuery } from '~/application/queries/get-products-with-level1-categories/get-products-with-level1-categories.query'

interface GetProductsWithLevel1CategoriesPayload {
  productIds: string[]
}

@Controller()
export class GetProductsWithLevel1CategoriesConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  @MessagePattern('get.products.with.level1.categories')
  async handleGetProductsWithLevel1Categories(
    @Payload() data: GetProductsWithLevel1CategoriesPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log('Event get.products.with.level1.categories received:', data)

    const result = await this.handleWithRetry(context, async () => {
      return await this.queryBus.execute(new GetProductsWithLevel1CategoriesQuery(data.productIds))
    })

    return result
  }
}
