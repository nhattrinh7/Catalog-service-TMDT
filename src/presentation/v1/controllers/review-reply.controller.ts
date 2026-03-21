import { Body, Controller, Param, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CreateReviewReplyCommand } from '~/application/commands/create-review-reply/create-review-reply.command'
import { CreateReviewReplyBodyDto } from '~/presentation/dtos/review-reply.dto'

@Controller('v1/reviews')
export class ReviewReplyController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/:id/reply')
  async createReviewReply(
    @Param('id') id: string,
    @Body() body: CreateReviewReplyBodyDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new CreateReviewReplyCommand(
      id,
      body.shopId,
      body.content,
    ))

    return { message: 'Create review reply successful' }
  }
}
