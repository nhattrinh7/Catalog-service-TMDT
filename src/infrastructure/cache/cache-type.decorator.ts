import { SetMetadata } from '@nestjs/common'
import { type CacheTypeValue } from '~/common/constants/cache.constant'

export const CACHE_TYPE_KEY = 'cacheType'
export const CacheType = (type: CacheTypeValue) => SetMetadata(CACHE_TYPE_KEY, type)

/**
 * Decorator giống như dán 1 tờ giấy ghi chú lên cửa phòng làm việc để cung cấp thông tin. Interceptor là bác bảo vệ sẽ đọc 
 * kiểm tra tờ giấy và quyết định phải làm gì
 */