import { IQuery } from '@nestjs/cqrs'

export class GetShopProductsPaginatedQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly shopId: string, // BẮT BUỘC - phải đứng trước các optional params
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly approveStatus?: string,
  ) {}
}
