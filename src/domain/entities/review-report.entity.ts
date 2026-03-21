import { v4 as uuidv4 } from 'uuid'
import { ReviewReportReason, ReviewReportStatus } from '~/domain/enums/review-report.enum'

export class ReviewReport {
  constructor(
    public readonly id: string,
    public readonly reviewId: string,
    public readonly reporterId: string,
    public readonly reporterUsername: string,
    public readonly reporterAvatar: string | null,
    public readonly reason: ReviewReportReason,
    public description: string | null,
    public status: ReviewReportStatus,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    reviewId: string
    reporterId: string
    reporterUsername: string
    reporterAvatar?: string | null
    reason: ReviewReportReason
    description?: string | null
  }): ReviewReport {
    return new ReviewReport(
      uuidv4(),
      props.reviewId,
      props.reporterId,
      props.reporterUsername,
      props.reporterAvatar ?? null,
      props.reason,
      props.description ?? null,
      ReviewReportStatus.PENDING,
      new Date(),
    )
  }
}
