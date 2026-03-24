import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager'
import { ExecutionContext, Injectable, Inject, type CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CACHE_TYPE_KEY } from '~/infrastructure/cache/cache-type.decorator'
import { type CacheTypeValue } from '~/common/constants/cache.constant'
import { CACHE_RESOURCE_KEY } from '~/infrastructure/cache/cache-prefix.decorator'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import type { Cache } from 'cache-manager'


// ***
// CustomCacheInterceptor của bạn đang extends CacheInterceptor của @nestjs/cache-manager. 
// Và cái interceptor gốc của NestJS nó có một tính năng bảo mật mặc định (ngầm định) cực kỳ gây ức chế 
// nếu không đọc kỹ Docs: "Nếu nó thấy request gửi lên có chứa header authorization, 
// nó sẽ TỪ CHỐI cache (bỏ qua luôn)". Nó sợ là dữ liệu mật của người này sẽ bị dính vào cache 
// rồi người khác đọc được.
// ***
@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector
  ) {
    super(cacheManager, reflector)
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('--- CustomCacheInterceptor: Intercepting Request ---')
    try {
      const observable = await super.intercept(context, next)
      return observable.pipe(
        tap({
          next: () => console.log('--- CustomCacheInterceptor: Data received from handler, key: ', this.trackBy(context)),
          error: (err) => console.error('--- CustomCacheInterceptor: Handler Error ---', err)
        })
      )
    } catch (err) {
      console.error('--- CustomCacheInterceptor: Error in super.intercept ---', err)
      return next.handle()
    }
  }
  // chỉ override trackBy để tùy chỉnh logic tạo key
  // trackBy trả về 1 string, string này sẽ được dùng làm key, nếu trả về undefined thì nó sẽ ko cache request đó
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest()

    // Chỉ cache GET requests
    if (request.method !== 'GET') return undefined

    // Dùng reflector để lấy metadata từ decorator
    const cacheType = this.reflector.get<CacheTypeValue>(CACHE_TYPE_KEY, context.getHandler())
    const cacheResource = this.reflector.get<string>(CACHE_RESOURCE_KEY, context.getHandler())

    // Nếu không có decorator @CacheType() và @CacheResource() thì không cache
    if (!cacheType || !cacheResource) return undefined

    const url: string = request.originalUrl
    const keySuffix = url.includes('?') ? url.split('?')[1] : url

    switch (cacheType) {
      case 'list': {
        return `cache:list:${cacheResource}:${keySuffix}`
      }

      case 'detail': {
        return `cache:detail:${cacheResource}:${request.params.id}`
      }

      case 'personal': {
        const userId = request.params.id || request.headers['x-user-id']
        return `cache:personal:${cacheResource}:${userId}`
      }

    }
  }
  
  // Mặc định CacheInterceptor của NestJS sẽ KHÔNG cache nếu request có header 'authorization'
  // (để tránh rò rỉ dữ liệu nhạy cảm của user này sang user khác).
  // Nhưng ở đây các thông tin sản phẩm/voucher là công khai, và do qua Kong/Auth-service 
  // nên lúc nào cũng có token, vì vậy ta phải override lại để cho phép cache.
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return request.method === 'GET'
  }
}
