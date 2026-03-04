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
    const result = await this.handleWithRetry(context, async () => {
      this.logger.log(`Event get.products.with.level1.categories received, count=${data.productIds.length}`)
      return await this.queryBus.execute(new GetProductsWithLevel1CategoriesQuery(data.productIds))
    })

    return result
  }
}
