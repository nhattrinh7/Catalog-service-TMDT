import { Module } from '@nestjs/common'
import { ElasticsearchModule as NestElasticsearchModule  } from '@nestjs/elasticsearch'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ElasticsearchService } from '~/infrastructure/elasticsearch/elasticsearch.service'
import { ProductSearchRepository } from '~/infrastructure/elasticsearch/repositories/product-search.repository'
import { PRODUCT_SEARCH_REPOSITORY } from '~/domain/repositories/product-search.repository.interface'

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      }),
    }),
  ],
  providers: [
    ElasticsearchService,
    {
      provide: PRODUCT_SEARCH_REPOSITORY,
      useClass: ProductSearchRepository,
    },
  ],
  exports: [
    PRODUCT_SEARCH_REPOSITORY,
    NestElasticsearchModule,
  ],
})
export class ElasticsearchModule {}
