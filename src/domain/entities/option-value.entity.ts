import { AggregateRoot } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'

export class OptionValue extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly value: string,
    public readonly optionId: string,
  ) {
    super()
  }

  static create(props: { value: string; optionId: string }): OptionValue {
    return new OptionValue(
      uuidv4(), 
      props.value, 
      props.optionId
    )
  }
}
