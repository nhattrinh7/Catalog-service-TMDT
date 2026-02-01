import { OptionValue } from '~/domain/entities/option-value.entity'

export interface IOptionValueRepository {
  createMany(optionValues: OptionValue[]): Promise<OptionValue[]>
  findByValues(values: string[]): Promise<OptionValue[]>
  findByOptionIds(optionIds: string[]): Promise<OptionValue[]>
  deleteByIds(ids: string[]): Promise<void>
}

export const OPTION_VALUE_REPOSITORY = Symbol('IOptionValueRepository')
