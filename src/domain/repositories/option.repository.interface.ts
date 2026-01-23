import { Option } from '~/domain/entities/option.entity'

export interface IOptionRepository {
  create(option: Option): Promise<Option>
  findByName(name: string): Promise<Option | null>
}

export const OPTION_REPOSITORY = Symbol('IOptionRepository')
