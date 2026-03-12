import { v4 as uuidv4 } from 'uuid'
import { ReviewReportReason, ReviewReportStatus } from '~/domain/enums/review-report.enum'

export class ReviewReport {
  constructor(
    public readonly id: string,
    public readonly reviewId: string,
    public readonly reporterId: string,
    public readonly reason: ReviewReportReason,
    public description: string | null,
    public status: ReviewReportStatus,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    reviewId: string
    reporterId: string
    reason: ReviewReportReason
    description?: string | null
  }): ReviewReport {
    return new ReviewReport(
      uuidv4(),
      props.reviewId,
      props.reporterId,
      props.reason,
      props.description ?? null,
      ReviewReportStatus.PENDING,
      new Date(),
    )
  }
}
