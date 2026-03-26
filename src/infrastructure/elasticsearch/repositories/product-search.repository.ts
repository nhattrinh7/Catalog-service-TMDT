import { Injectable, Logger } from '@nestjs/common'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { ProductSearchDocument } from '~/domain/interfaces/product.interface'
import { PRODUCTS_INDEX } from '~/common/constants/index.constants'

@Injectable()
export class ProductSearchRepository implements IProductSearchRepository {
  private readonly logger = new Logger(ProductSearchRepository.name)

  constructor(private readonly esService: NestElasticsearchService) {}

  async indexProduct(product: ProductSearchDocument): Promise<void> {
    try {
      await this.esService.index({
        index: PRODUCTS_INDEX,
        id: product.id,
        document: product,
      })
      this.logger.debug(`Indexed product: ${product.id}`)
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}:`, error)
      throw error
    }
  }

  async updateProduct(id: string, product: Partial<ProductSearchDocument>): Promise<void> {
    try {
      await this.esService.update({
        index: PRODUCTS_INDEX,
        id,
        doc: product,
      })
      this.logger.debug(`Updated product: ${id}`)
    } catch (error) {
      this.logger.error(`Failed to update product ${id}:`, error)
      throw error
    }
  }

  async incrementBuyCount(productId: string, quantity: number): Promise<void> {
    try {
      await this.esService.update({
        index: PRODUCTS_INDEX,
        id: productId,
        script: {
          source: 'ctx._source.buy_count = (ctx._source.buy_count != null ? ctx._source.buy_count : 0) + params.count',
          params: { count: quantity },
        },
      })
      this.logger.debug(`Incremented buy_count for product: ${productId} (+${quantity})`)
    } catch (error) {
      this.logger.error(`Failed to increment buy_count for product ${productId}:`, error)
      throw error
    }
  }

  async decrementBuyCount(productId: string, quantity: number): Promise<void> {
    try {
      await this.esService.update({
        index: PRODUCTS_INDEX,
        id: productId,
        script: {
          source: 'ctx._source.buy_count = Math.max(0, (ctx._source.buy_count != null ? ctx._source.buy_count : 0) - params.count)',
          params: { count: quantity },
        },
      })
      this.logger.debug(`Decremented buy_count for product: ${productId} (-${quantity})`)
    } catch (error) {
      this.logger.error(`Failed to decrement buy_count for product ${productId}:`, error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.esService.delete({
        index: PRODUCTS_INDEX,
        id,
      })
      this.logger.debug(`Deleted product: ${id}`)
    } catch (error) {
      this.logger.error(`Failed to delete product ${id}:`, error)
      throw error
    }
  }

  async bulkIndex(products: ProductSearchDocument[]): Promise<void> {
    if (products.length === 0) return

    try {
      const operations = products.flatMap((product) => [
        { index: { _index: PRODUCTS_INDEX, _id: product.id } },
        product,
      ])

      const result = await this.esService.bulk({ operations })

      if (result.errors) {
        const errorItems = result.items.filter((item) => item.index?.error)
        this.logger.error(`Bulk index errors:`, errorItems)
      }

      this.logger.debug(`Bulk indexed ${products.length} products`)
    } catch (error) {
      this.logger.error(`Failed to bulk index products:`, error)
      throw error
    }
  }
}
