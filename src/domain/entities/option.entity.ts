import { AggregateRoot } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'

export class Option extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {
    super()
  }

  static create(props: { name: string }): Option {
    return new Option(
      uuidv4(), 
      props.name
    )
  }
}
