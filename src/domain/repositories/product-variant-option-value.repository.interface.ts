export interface IProductVariantOptionValueRepository {
  createMany(data: { variantId: string; optionValueId: string }[]): Promise<void>
}

export const PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY = Symbol('IProductVariantOptionValueRepository')
