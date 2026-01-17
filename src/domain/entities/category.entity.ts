import { AggregateRoot } from '@nestjs/cqrs'
import { CreateCategoryBodyDto } from '~/presentation/dtos/category.dto'
import { v4 as uuidv4 } from 'uuid'
import { Prisma } from '@prisma/client'

export class Category extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly parentId: string | null,
    public readonly attributes: Prisma.JsonValue | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super()
  }

  static create(props: CreateCategoryBodyDto): Category {
    const category = new Category(
      uuidv4(),
      props.name,
      props.description,
      props.parentId,
      props.attributes,
      new Date(),
      new Date(),
    )
    
    return category
  }
}