import {
  Controller,
  Param,
  Post,
  Body,
  Headers,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CreateReviewReportCommand } from '~/application/commands/create-review-report/create-review-report.command'
import { CreateReviewReportBodyDto } from '~/presentation/dtos/review-report.dto'

@Controller('v1/reviews')
export class ReportReviewController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/:id/report')
  async reportReview(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateReviewReportBodyDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new CreateReviewReportCommand(id, userId, body))

    return { message: 'Report review successful' }
  }

}
