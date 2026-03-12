import { ICommand } from '@nestjs/cqrs'
import { CreateReviewReportBodyDto } from '~/presentation/dtos/review-report.dto'

export class CreateReviewReportCommand implements ICommand {
  constructor(
    public readonly reviewId: string,
    public readonly reporterId: string,
    public readonly body: CreateReviewReportBodyDto,
  ) {}
}
