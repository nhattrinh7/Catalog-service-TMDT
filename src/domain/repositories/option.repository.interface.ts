import { Option } from '~/domain/entities/option.entity'

export interface IOptionRepository {
  create(option: Option, tx?: any): Promise<Option>
  findByName(name: string): Promise<Option | null>
  findByProductId(productId: string): Promise<Option[]>
  deleteByIds(ids: string[], tx?: any): Promise<void>
}

export const OPTION_REPOSITORY = Symbol('IOptionRepository')
