import { AggregateRoot } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { CreateProductVariantDto } from '~/presentation/dtos/product-variant.dto'

export class ProductVariant extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public sku: string,
    public price: number,
    public image: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    super()
  }

  static create(props: CreateProductVariantDto): ProductVariant {
    const productVariant = new ProductVariant(
      uuidv4(),
      props.productId,
      props.sku,
      props.price,
      props.image,
      new Date(),
      new Date(),
    )
    
    return productVariant
  }

  update(props: {
    sku: string
    price: number
    image: string
  }): void {
    this.sku = props.sku
    this.price = props.price
    this.image = props.image
    this.updatedAt = new Date()
  }
}