import { OptionValue } from '~/domain/entities/option-value.entity'

export interface IOptionValueRepository {
  createMany(optionValues: OptionValue[]): Promise<OptionValue[]>
  findByValues(values: string[]): Promise<OptionValue[]>
}

export const OPTION_VALUE_REPOSITORY = Symbol('IOptionValueRepository')
