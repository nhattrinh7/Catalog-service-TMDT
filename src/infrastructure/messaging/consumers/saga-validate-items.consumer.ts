import { Controller, Inject } from '@nestjs/common'
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { SagaValidateItemsCommand } from '~/application/commands/saga-validate-items/saga-validate-items.command'
import { MESSAGE_PUBLISHER, type IMessagePublisher } from '~/domain/contracts/message-publisher.interface'

@Controller()
export class SagaValidateItemsConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {
    super()
  }

  @EventPattern('saga.validate-items')
  async handleValidateItems(
    @Payload() data: { sagaId: string; productVariantIds: string[] },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event saga.validate-items received, sagaId=${data.sagaId}`)
      try {
        const result = await this.commandBus.execute(
          new SagaValidateItemsCommand(data.sagaId, data.productVariantIds),
        )

        if (!result.success) {
          this.messagePublisher.emitToSagaOrchestrator('saga.result.validate-items', {
            sagaId: data.sagaId,
            success: false,
            error: result.error,
          })
          return
        }

        this.messagePublisher.emitToSagaOrchestrator('saga.result.validate-items', {
          sagaId: data.sagaId,
          success: true,
          variants: result.variants,
        })
      } catch (error: any) {
        this.messagePublisher.emitToSagaOrchestrator('saga.result.validate-items', {
          sagaId: data.sagaId,
          success: false,
          error: error.message || 'Lỗi validate items',
        })
      }
    })
  }
}
