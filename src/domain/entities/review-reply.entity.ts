import { v4 as uuidv4 } from 'uuid'

export class ReviewReply {
  constructor(
    public readonly id: string,
    public readonly reviewId: string,
    public readonly shopId: string,
    public content: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    reviewId: string
    shopId: string
    content: string
  }): ReviewReply {
    return new ReviewReply(
      uuidv4(),
      props.reviewId,
      props.shopId,
      props.content,
      new Date(),
    )
  }
}
