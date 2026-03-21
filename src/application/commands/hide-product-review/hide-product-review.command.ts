import { ICommand } from '@nestjs/cqrs'

export class HideProductReviewCommand implements ICommand {
  constructor(
    public readonly reviewId: string,
  ) {}
}
