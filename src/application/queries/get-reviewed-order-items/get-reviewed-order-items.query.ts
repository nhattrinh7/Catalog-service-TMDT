export class GetReviewedOrderItemsQuery {
  constructor(
    public readonly items: Array<{ orderId: string; productId: string }>,
  ) {}
}
