import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { DecreaseBuyCountCommand } from '~/application/commands/decrease-buy-count/decrease-buy-count.command'

@Controller()
export class OrderDecreaseBuyCountConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus,
  ) {
    super()
  }

  @EventPattern('order.decrease-buy-count')
  async handleDecreaseBuyCount(
    @Payload() data: { orderId: string; items: Array<{ productId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event order.decrease-buy-count received, orderId=${data.orderId}`)
      try {
        await this.commandBus.execute(new DecreaseBuyCountCommand(data.items))
      } catch (error: any) {
        this.logger.error(`Decrease buy_count failed: ${error.message}`)
      }
    })
  }
}
