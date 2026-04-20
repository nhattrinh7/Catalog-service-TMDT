import { Controller, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Subject } from 'rxjs'
import { debounceTime, groupBy, mergeMap } from 'rxjs/operators'
import { Payload, MessagePattern } from '@nestjs/microservices'
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '~/domain/repositories/product.repository.interface'
import {
  PRODUCT_SEARCH_REPOSITORY,
  type IProductSearchRepository,
} from '~/domain/repositories/product-search.repository.interface'
import { ProductSearchMapper } from '~/infrastructure/elasticsearch/mappers/product-search.mapper'
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '~/domain/repositories/category.repository.interface'

@Controller()
export class CatalogCdcConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CatalogCdcConsumer.name)
  private updateSubject = new Subject<string>()

  onModuleInit() {
    this.updateSubject
      .pipe(
        // Chia các message thành các "nhóm nhỏ" tương ứng với từng productId độc lập
        groupBy(id => id),
        // Trong mỗi nhóm productId, chờ tĩnh lặng (Debounce) 500ms không nhận thêm tin nhắn nào nữa thì mới xuất kích cập nhật
        mergeMap(group => group.pipe(debounceTime(500))),
      )
      .subscribe(productId => {
        this.repollAndUpsert(productId).catch(err => {
          this.logger.error(`Failed to update ES inside RxJS stream for ${productId}: ${err.message}`)
        })
      })
  }

  onModuleDestroy() {
    this.updateSubject.complete()
  }

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepo: IProductSearchRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  @MessagePattern('postgres.public.products')
  async handleProductCdc(@Payload() message: any) {
    if (!message) return

    const data = message.payload || message
    const { op, before, after } = data

    if (op === 'd' && before?.id) {
      await this.productSearchRepo.deleteProduct(before.id)
      this.logger.debug(`Deleted catalog ES document via CDC: ${before.id}`)
      return
    }

    const productId = after?.id
    if (!productId) return

    this.updateSubject.next(productId)
  }

  @MessagePattern('postgres.public.product_variants')
  handleProductVariantCdc(@Payload() message: any) {
    if (!message) return

    const data = message.payload || message
    const { before, after } = data
    
    // Gom nhóm SPU lại dù bất kì variant nào thay đổi
    const productId = after?.product_id || before?.product_id
    if (!productId) return

    this.updateSubject.next(productId)
  }

  private async repollAndUpsert(productId: string) {
    try {
      // 1. Repoll (Đọc lại gốc DB để lấy SPU mới nhất định dạng cây, có chứa các variants)
      const product = (await this.productRepository.findByIdWithVariants(productId)) as any
      
      // CHỐNG RÒ RỈ DỮ LIỆU: Nếu SP bị xóa hoặc "CHƯA ĐƯỢC DUYỆT" (PENDING/REJECTED) -> Xóa sổ khỏi Elasticsearch ngay!
      if (!product || product.isDeleted || product.approveStatus !== 'ACCEPTED') {
        await this.productSearchRepo.deleteProduct(productId).catch(() => {})
        return
      }

      // Xây dựng sơ đồ danh mục
      const categoryHierarchy = await this.categoryRepository.getCategoryHierarchy(product.categoryId)
      const categoryName = product.category?.name || 'Unknown'

      // 2. Map thành SPU lớn
      const esDocumentFull = ProductSearchMapper.toElasticDocument(
        product,
        product.variants,
        categoryName,
        categoryHierarchy,
        0,
        true,
      )

      // 3. Tách riêng buy_count và is_in_stock ra khỏi partialDoc (không ghi đè lên ES khi update)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { buy_count, is_in_stock, ...partialDoc } = esDocumentFull

      // 4. Scripted Upsert:
      // - Document chưa tồn tại (lần đầu approve): dùng esDocumentFull làm bản ghi khởi tạo (có buy_count: 0, is_in_stock: true)
      // - Document đã tồn tại (update tên, giá...): script chỉ cập nhật các trường catalog, không đụng vào buy_count và is_in_stock
      await this.productSearchRepo.upsertCatalogInfo(productId, partialDoc, esDocumentFull)
      this.logger.log(`Repolled and upserted catalog CDC info for SPU: ${productId}`)
    } catch (error: any) {
      this.logger.error(`Failed to handle CDC repoll for productId ${productId}: ${error.message}`)
    }
  }
}
