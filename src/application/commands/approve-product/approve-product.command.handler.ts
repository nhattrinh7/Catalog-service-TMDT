import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ApproveProductCommand } from '~/application/commands/approve-product/approve-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'

@CommandHandler(ApproveProductCommand)
export class ApproveProductHandler implements ICommandHandler<ApproveProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: ApproveProductCommand) {
    const { id } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Gọi method approve() của entity
    product.approve()

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)
  }
}
