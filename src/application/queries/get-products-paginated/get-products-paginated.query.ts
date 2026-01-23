export class GetProductsPaginatedQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly search: string | undefined,
    public readonly approveStatus: string | undefined,
    public readonly roleId: string,
  ) {}
}
