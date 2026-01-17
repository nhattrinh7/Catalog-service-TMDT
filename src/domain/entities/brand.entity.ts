import { AggregateRoot } from '@nestjs/cqrs'
import { CreateBrandBodyDto, UpdateBrandBodyDto } from '~/presentation/dtos/brand.dto'
import { v4 as uuidv4 } from 'uuid'

export class Brand extends AggregateRoot {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public logo: string,
    public country: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    super()
  }

  static create(props: CreateBrandBodyDto): Brand {
    const brand = new Brand(
      uuidv4(),
      props.name,
      props.description,
      props.logo,
      props.country,
      new Date(),
      new Date(),
    )
    
    return brand
  }

  update(props: UpdateBrandBodyDto): void {
    if (props.name !== undefined) this.name = props.name
    if (props.description !== undefined) this.description = props.description
    if (props.logo !== undefined) this.logo = props.logo
    if (props.country !== undefined) this.country = props.country
    this.updatedAt = new Date()
  }
}