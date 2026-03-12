import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { IReviewReportRepository } from '~/domain/repositories/review-report.repository.interface'
import { ReviewReport } from '~/domain/entities/review-report.entity'
import { ReviewReportMapper } from '~/infrastructure/database/mappers/review-report.mapper'

@Injectable()
export class ReviewReportRepository implements IReviewReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(report: ReviewReport, tx?: any): Promise<ReviewReport> {
    const client = tx ?? this.prisma
    const data = ReviewReportMapper.toPersistence(report)

    const created = await client.reviewReport.create({ data })

    return ReviewReportMapper.toDomain(created)
  }
}
