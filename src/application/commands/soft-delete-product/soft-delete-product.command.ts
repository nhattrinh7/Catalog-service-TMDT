export class SoftDeleteProductCommand {
  constructor(
    public readonly productId: string,
    public readonly deletedBy: string,
  ) {}
}
