import { ICommand } from '@nestjs/cqrs'
import { CreateProductReviewBodyDto } from '~/presentation/dtos/product-review.dto'

export class CreateProductReviewCommand implements ICommand {
  constructor(
    public readonly productId: string,
    public readonly userId: string,
    public readonly body: CreateProductReviewBodyDto,
  ) {}
}
