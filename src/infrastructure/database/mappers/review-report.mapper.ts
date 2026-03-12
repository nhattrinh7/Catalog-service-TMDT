import { ReviewReport as PrismaReviewReport } from '@prisma/client'
import { ReviewReport } from '~/domain/entities/review-report.entity'
import { ReviewReportReason, ReviewReportStatus } from '~/domain/enums/review-report.enum'

export class ReviewReportMapper {
  static toDomain(prismaReport: PrismaReviewReport): ReviewReport {
    return new ReviewReport(
      prismaReport.id,
      prismaReport.reviewId,
      prismaReport.reporterId,
      prismaReport.reason as ReviewReportReason,
      prismaReport.description,
      prismaReport.status as ReviewReportStatus,
      prismaReport.createdAt,
    )
  }

  static toPersistence(report: ReviewReport) {
    return {
      id: report.id,
      reviewId: report.reviewId,
      reporterId: report.reporterId,
      reason: report.reason as any,
      description: report.description,
      status: report.status as any,
      createdAt: report.createdAt,
    }
  }
}
