import { IQuery } from '@nestjs/cqrs'

export class GetShopReviewsPaginatedQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly shopId: string,
    public readonly ratings?: number[],
    public readonly search?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}
