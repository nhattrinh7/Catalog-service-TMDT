import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { IncreaseBuyCountCommand } from '~/application/commands/increase-buy-count/increase-buy-count.command'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'

@CommandHandler(IncreaseBuyCountCommand)
export class IncreaseBuyCountHandler implements ICommandHandler<IncreaseBuyCountCommand, void> {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
  ) {}

  async execute(command: IncreaseBuyCountCommand): Promise<void> {
    const { items } = command
    for (const item of items) {
      await this.productSearchRepository.incrementBuyCount(item.productId, item.quantity)
    }
  }
}
