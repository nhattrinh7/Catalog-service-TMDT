import { ICommand } from '@nestjs/cqrs'

export class CreateReviewReplyCommand implements ICommand {
  constructor(
    public readonly reviewId: string,
    public readonly shopId: string,
    public readonly content: string,
  ) {}
}
