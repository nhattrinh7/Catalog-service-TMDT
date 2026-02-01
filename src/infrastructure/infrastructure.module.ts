import { Module } from '@nestjs/common'
import { DatabaseModule } from '~/infrastructure/database/database.module'
import { MessagingModule } from '~/infrastructure//messaging/messaging.module'
import { ElasticsearchModule } from '~/infrastructure/elasticsearch/elasticsearch.module'

@Module({
  imports: [DatabaseModule, MessagingModule, ElasticsearchModule],
  providers: [],
  exports: [],
})
export class InfrastructureModule {}

