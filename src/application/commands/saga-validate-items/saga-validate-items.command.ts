export class SagaValidateItemsCommand {
  constructor(
    public readonly sagaId: string,
    public readonly productVariantIds: string[],
  ) {}
}
