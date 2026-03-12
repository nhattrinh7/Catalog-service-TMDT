import { ReviewReport } from '~/domain/entities/review-report.entity'

export interface IReviewReportRepository {
  create(report: ReviewReport, tx?: any): Promise<ReviewReport>
}

export const REVIEW_REPORT_REPOSITORY = Symbol('IReviewReportRepository')
