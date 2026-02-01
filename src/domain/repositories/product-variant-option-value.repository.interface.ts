export interface IProductVariantOptionValueRepository {
  createMany(data: { variantId: string; optionValueId: string }[]): Promise<void>
  findByVariantIds(variantIds: string[]): Promise<{ variantId: string; optionValue: { id: string; value: string; option: { id: string; name: string } } }[]>
  deleteByVariantIds(variantIds: string[]): Promise<void>
  deleteByOptionValueIds(optionValueIds: string[]): Promise<void>
}

export const PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY = Symbol('IProductVariantOptionValueRepository')
