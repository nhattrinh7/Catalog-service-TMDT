import { Controller, Inject } from '@nestjs/common'
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { IncreaseBuyCountCommand } from '~/application/commands/increase-buy-count/increase-buy-count.command'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

@Controller()
export class SagaIncreaseBuyCountConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {
    super()
  }

  @EventPattern('saga.increase-buy-count')
  async handleIncreaseBuyCount(
    @Payload() data: { sagaId: string; items: Array<{ productId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event saga.increase-buy-count received, sagaId=${data.sagaId}`)
      try {
        await this.commandBus.execute(new IncreaseBuyCountCommand(data.items))
      } catch (error: any) {
        this.logger.error(`Increase buy_count failed: ${error.message}`)
      }

      this.messagePublisher.emitToSagaOrchestrator('saga.result.increase-buy-count', {
        sagaId: data.sagaId,
        success: true,
      })
    })
  }
}
