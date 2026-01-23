import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RejectProductCommand } from '~/application/commands/reject-product/reject-product.command'
import { PRODUCT_REPOSITORY, type IProductRepository } from '~/domain/repositories/product.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'

@CommandHandler(RejectProductCommand)
export class RejectProductHandler implements ICommandHandler<RejectProductCommand, void> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: RejectProductCommand) {
    const { id, rejectReason } = command

    // 1. Lấy product từ DB
    const product = await this.productRepository.findById(id)
    if (!product) throw new NotFoundException('This product is not exist')

    // 2. Gọi method reject() của entity
    product.reject(rejectReason)

    // 3. Lưu thay đổi vào DB bằng method update
    await this.productRepository.update(product)
  }
}
