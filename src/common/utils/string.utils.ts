/**
 * Convert snake_case string to camelCase
 * @example
 * snakeToCamelCase('shop_id') // 'shopId'
 * snakeToCamelCase('main_image') // 'mainImage'
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert object keys from snake_case to camelCase
 * @example
 * snakeToCamelObject({ shop_id: '123', main_image: 'url' })
 * // { shopId: '123', mainImage: 'url' }
 */
export function snakeToCamelObject<T = any>(obj: any): T {
  const converted: any = {}
  for (const key in obj) {
    const camelKey = snakeToCamelCase(key)
    converted[camelKey] = obj[key]
  }
  return converted
}

/**
 * Convert camelCase string to snake_case
 * @example
 * camelToSnakeCase('shopId') // 'shop_id'
 * camelToSnakeCase('mainImage') // 'main_image'
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
