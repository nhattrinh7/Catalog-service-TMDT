import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { PRODUCTS_INDEX } from '~/common/constants/index.constants'
import { PRODUCTS_INDEX_CONFIG } from '~/infrastructure/elasticsearch/indices/products.index'

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name)

  constructor(private readonly esService: NestElasticsearchService) {}

  async onModuleInit() {
    await this.ensureIndices()
  }

  private async ensureIndices() {
    await this.ensureIndex(PRODUCTS_INDEX, PRODUCTS_INDEX_CONFIG)
  }

  private async ensureIndex(indexName: string, config: typeof PRODUCTS_INDEX_CONFIG) {
    try {
      const exists = await this.esService.indices.exists({ index: indexName })

      if (!exists) {
        await this.esService.indices.create(config)
        this.logger.log(`Index "${indexName}" created successfully`)
      } else {
        this.logger.log(`Index "${indexName}" already exists`)
      }
    } catch (error) {
      this.logger.error(`Failed to ensure index "${indexName}":`, error)
      throw error
    }
  }
}
