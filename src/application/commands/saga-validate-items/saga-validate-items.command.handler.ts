import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { SagaValidateItemsCommand } from './saga-validate-items.command'
import { GetVariantsBatchQuery } from '~/application/queries/get-variants-batch/get-variants-batch.query'

interface ValidateItemsResult {
  success: boolean
  variants?: any[]
  error?: string
}

@CommandHandler(SagaValidateItemsCommand)
export class SagaValidateItemsHandler implements ICommandHandler<SagaValidateItemsCommand, ValidateItemsResult> {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: SagaValidateItemsCommand): Promise<ValidateItemsResult> {
    const { productVariantIds } = command

    const result = await this.queryBus.execute(
      new GetVariantsBatchQuery(productVariantIds),
    )
    const variants = result.variants

    if (!variants || variants.length !== productVariantIds.length) {
      const foundIds = (variants || []).map((v: any) => v.id)
      const missingIds = productVariantIds.filter(id => !foundIds.includes(id))
      return {
        success: false,
        error: `Sản phẩm không tồn tại: ${missingIds.join(', ')}`,
      }
    }

    return { success: true, variants }
  }
}
