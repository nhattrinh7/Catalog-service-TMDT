import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HideProductCommand } from '~/application/commands/hide-product/hide-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'

@CommandHandler(HideProductCommand)
export class HideProductHandler implements ICommandHandler<HideProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
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
  }
}
