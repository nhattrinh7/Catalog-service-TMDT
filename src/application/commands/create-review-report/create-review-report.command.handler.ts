import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { CreateReviewReportCommand } from '~/application/commands/create-review-report/create-review-report.command'
import { REVIEW_REPORT_REPOSITORY, type IReviewReportRepository } from '~/domain/repositories/review-report.repository.interface'
import { ReviewReport } from '~/domain/entities/review-report.entity'

@CommandHandler(CreateReviewReportCommand)
export class CreateReviewReportHandler implements ICommandHandler<CreateReviewReportCommand, void> {
  constructor(
    @Inject(REVIEW_REPORT_REPOSITORY)
    private readonly reviewReportRepository: IReviewReportRepository,
  ) {}

  async execute(command: CreateReviewReportCommand) {
    const { reviewId, reporterId, body } = command

    // Tạo ReviewReport entity
    const report = ReviewReport.create({
      reviewId,
      reporterId,
      reporterUsername: body.reporterUsername,
      reporterAvatar: body.reporterAvatar,
      reason: body.reason,
      description: body.description,
    })

    await this.reviewReportRepository.create(report)
  }
}
