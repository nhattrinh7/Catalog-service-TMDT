import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetVariantsBatchQuery } from '~/application/queries/get-variants-batch/get-variants-batch.query'

interface GetVariantsBatchPayload {
  productVariantIds: string[]
}

@Controller()
export class GetVariantsBatchConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  @MessagePattern('get.variants.batch')
  async handleGetVariantsBatch(
    @Payload() data: GetVariantsBatchPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log('Event get.variants.batch received:', data)

    const result = await this.handleWithRetry(context, async () => {
      return await this.queryBus.execute(new GetVariantsBatchQuery(data.productVariantIds))
    })

    return result
  }
}
