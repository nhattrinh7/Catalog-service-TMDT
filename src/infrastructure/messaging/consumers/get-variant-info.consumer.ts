import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetVariantInfoQuery } from '~/application/queries/get-variant-info/get-variant-info.query'

interface GetVariantInfoPayload {
  productVariantId: string
}

@Controller()
export class GetVariantInfoConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  @MessagePattern('get.variant.info')
  async handleGetVariantInfo(
    @Payload() data: GetVariantInfoPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log('Event get.variant.info received:', data)

    const result = await this.handleWithRetry(context, async () => {
      return await this.queryBus.execute(new GetVariantInfoQuery(data.productVariantId))
    })

    return result
  }
}
