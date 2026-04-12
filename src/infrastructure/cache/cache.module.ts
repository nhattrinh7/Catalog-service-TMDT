import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CacheEvictListener } from '~/infrastructure/cache/cache-evict.listener'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          password: configService.get<string>('REDIS_PASSWORD'),
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          ttl: 300_000, // default TTL 5 phút (milliseconds)
        })

        // Keyv 5 (được dùng bởi cache-manager v6/v7 trong @nestjs/cache-manager v3)
        // yêu cầu method 'delete' và 'clear'.
        // Trong khi redisStore (chuẩn cũ) cung cấp 'del' và 'reset'.
        // Ta cần alias chúng để không bị lỗi "Invalid storage adapter".
        if (typeof (store as any).del === 'function' && !(store as any).delete) {
          ;(store as any).delete = (store as any).del
        }
        if (typeof (store as any).reset === 'function' && !(store as any).clear) {
          ;(store as any).clear = (store as any).reset
        }

        return {
          stores: [store],
        }
      },
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [CacheEvictListener],
  exports: [CacheModule],
})
export class AppCacheModule {}
