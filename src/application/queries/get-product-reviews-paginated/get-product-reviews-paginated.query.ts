import { IQuery } from '@nestjs/cqrs'

export class GetProductReviewsPaginatedQuery implements IQuery {
  constructor(
    public readonly productId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly rating?: string,
    public readonly hasMedia?: boolean,
  ) {}
}
