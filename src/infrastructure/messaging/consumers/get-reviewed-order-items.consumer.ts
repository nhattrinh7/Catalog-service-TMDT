import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetReviewedOrderItemsQuery } from '~/application/queries/get-reviewed-order-items/get-reviewed-order-items.query'

interface GetReviewedOrderItemsPayload {
  items: Array<{ orderId: string; productId: string }>
}

@Controller()
export class GetReviewedOrderItemsConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  @MessagePattern('get.reviewed.order-items')
  async handleGetReviewedOrderItems(
    @Payload() data: GetReviewedOrderItemsPayload,
    @Ctx() context: RmqContext,
  ) {
    const result = await this.handleWithRetry(context, async () => {
      this.logger.log(`Event get.reviewed.order-items received, count=${data.items?.length || 0}`)
      return await this.queryBus.execute(new GetReviewedOrderItemsQuery(data.items || []))
    })

    return result
  }
}
