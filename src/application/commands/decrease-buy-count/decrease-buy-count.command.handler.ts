import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { DecreaseBuyCountCommand } from '~/application/commands/decrease-buy-count/decrease-buy-count.command'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'

@CommandHandler(DecreaseBuyCountCommand)
export class DecreaseBuyCountHandler implements ICommandHandler<DecreaseBuyCountCommand, void> {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
  ) {}

  async execute(command: DecreaseBuyCountCommand): Promise<void> {
    const { items } = command
    for (const item of items) {
      await this.productSearchRepository.decrementBuyCount(item.productId, item.quantity)
    }
  }
}
