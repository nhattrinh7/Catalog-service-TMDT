import { IQuery } from '@nestjs/cqrs'

export class GetReportedReviewsPaginatedQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly isHidden?: boolean,
  ) {}
}
