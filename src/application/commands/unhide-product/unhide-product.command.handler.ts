import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UnhideProductCommand } from '~/application/commands/unhide-product/unhide-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'

@CommandHandler(UnhideProductCommand)
export class UnhideProductHandler implements ICommandHandler<UnhideProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UnhideProductCommand) {
    const { id } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Gọi method unhide() của entity
    product.unhide()

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)
  }
}
