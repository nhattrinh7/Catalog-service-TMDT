import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HideProductCommand } from '~/application/commands/hide-product/hide-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CACHE_EVENT, CACHE_RESOURCE, CACHE_TYPE } from '~/common/constants/cache.constant'

@CommandHandler(HideProductCommand)
export class HideProductHandler implements ICommandHandler<HideProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: HideProductCommand) {
    const { id } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Gọi method hide() của entity
    product.hide()

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)

    // Invalidate cache product detail
    this.eventEmitter.emit(CACHE_EVENT.INVALIDATE, { type: CACHE_TYPE.DETAIL, resource: CACHE_RESOURCE.PRODUCTS, id })
  }
}
