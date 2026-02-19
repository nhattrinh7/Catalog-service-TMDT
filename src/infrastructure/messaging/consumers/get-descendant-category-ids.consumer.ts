import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetDescendantCategoryIdsQuery } from '~/application/queries/get-descendant-category-ids/get-descendant-category-ids.query'

interface GetDescendantCategoryIdsPayload {
  categoryIds: string[]
}

@Controller()
export class GetDescendantCategoryIdsConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  @MessagePattern('get.descendant.category.ids')
  async handleGetDescendantCategoryIds(
    @Payload() data: GetDescendantCategoryIdsPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log('Event get.descendant.category.ids received:', data)

    const result = await this.handleWithRetry(context, async () => {
      return await this.queryBus.execute(new GetDescendantCategoryIdsQuery(data.categoryIds))
    })

    return result
  }
}
