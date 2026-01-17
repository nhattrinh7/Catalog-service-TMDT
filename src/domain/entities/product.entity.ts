import { AggregateRoot } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { Prisma } from '@prisma/client'
import { ApproveProductStatus } from '~/domain/enums/product.enum'
import { CreateProductEntityDto } from '~/presentation/dtos/product.dto'

export class Product extends AggregateRoot {
  constructor(
    public readonly id: string,
    public name: string,
    public descriptions: string,
    public attributes: Prisma.JsonValue,
    public readonly shopId: string,
    public readonly categoryId: string,
    public mainImage: string,
    public galleryImage: Prisma.JsonValue,
    public video: string | null,
    public ratingAvg: number,
    public ratingCount: number,
    public unit: string,
    public isActive: boolean,
    public approveStatus: ApproveProductStatus,
    public rejectReason: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    super()
  }

  static create(props: CreateProductEntityDto): Product {
    const product = new Product(
      uuidv4(),
      props.name,
      props.descriptions,
      props.attributes,
      props.shopId,
      props.categoryId,
      props.mainImage,
      props.galleryImage,
      props.video,
      0,
      0,
      props.unit,
      true,
      ApproveProductStatus.PENDING,
      null,
      new Date(),
      new Date(),
    )
    
    return product
  }

  update(props: {
    name: string
    descriptions: string
    attributes: Prisma.JsonValue
    mainImage: string
    galleryImage: Prisma.JsonValue
    video: string | null
    unit: string
  }): void {
    this.name = props.name
    this.descriptions = props.descriptions
    this.attributes = props.attributes
    this.mainImage = props.mainImage
    this.galleryImage = props.galleryImage
    this.video = props.video
    this.unit = props.unit
  }
}