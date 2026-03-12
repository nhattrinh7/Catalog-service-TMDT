import { Module } from '@nestjs/common'
import { DatabaseModule } from '~/infrastructure/database/database.module'
import { MessagingModule } from '~/infrastructure//messaging/messaging.module'
import { ElasticsearchModule } from '~/infrastructure/elasticsearch/elasticsearch.module'
import { AppCacheModule } from '~/infrastructure/cache/cache.module'

@Module({
  imports: [DatabaseModule, MessagingModule, ElasticsearchModule, AppCacheModule],
  providers: [],
  exports: [],
})
export class InfrastructureModule {}

