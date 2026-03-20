import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { DatabaseModule } from '~/infrastructure/database/database.module'
import { MessagingModule } from '~/infrastructure/messaging/messaging.module'
import { ElasticsearchModule } from '~/infrastructure/elasticsearch/elasticsearch.module'
import { CloudinaryService } from '~/common/services/cloudinary.service'
import { CreateCategoryHandler } from './commands/create-category/create-category.command.handler'
import { GetCategoriesHandler } from './queries/get-categories/get-categories.query.handler'
import { UploadProductImageHandler } from './commands/upload-product-image/upload-product-image.command.handler'
import { CreateProductHandler } from './commands/create-product/create-product.command.handler'
import { ProductCreatedEventHandler } from './event-handlers/product-created.event-handler'
import { UploadProductVideoHandler } from './commands/upload-product-video/upload-product-video.command.handler'
import { GetShopProductsPaginatedHandler } from './queries/get-shop-products-paginated/get-shop-products-paginated.query.handler'
import { GetCategoryHandler } from './queries/get-category/get-category.query.handler'
import { GetProductWithVariantsHandler } from './queries/get-product-with-variants/get-product-with-variants.query.handler'
import { UpdateProductHandler } from './commands/update-product/update-product.command.handler'
import { ProductUpdatedEventHandler } from './event-handlers/product-updated.event-handler'
import { CreateBrandHandler } from './commands/create-brand/create-brand.command.handler'
import { DeleteBrandHandler } from './commands/delete-brand/delete-brand.command.handler'
import { UpdateBrandHandler } from './commands/update-brand/update-brand.command.handler'
import { UploadBrandLogoHandler } from './commands/upload-brand-logo/upload-brand-logo.command.handler'
import { GetBrandsPaginatedHandler } from './queries/get-brands-paginated/get-brands-paginated.query.handler'
import { GetRootCategoriesHandler } from './queries/get-root-categories/get-root-categories.query.handler'
import { GetProductsPaginatedHandler } from './queries/get-products-paginated/get-products-paginated.query.handler'
import { ApproveProductHandler } from './commands/approve-product/approve-product.command.handler'
import { RejectProductHandler } from './commands/reject-product/reject-product.command.handler'
import { HideProductHandler } from './commands/hide-product/hide-product.command.handler'
import { UnhideProductHandler } from './commands/unhide-product/unhide-product.command.handler'
import { SoftDeleteProductHandler } from './commands/soft-delete-product/soft-delete-product.command.handler'
import { GetProductReviewsPaginatedHandler } from './queries/get-product-reviews-paginated/get-product-reviews-paginated.query.handler'
import { GetProductToSoldHandler } from './queries/get-product-to-sold/get-product-to-sold.query.handler'
import { GetVariantInfoHandler } from './queries/get-variant-info/get-variant-info.query.handler'
import { GetProductsWithLevel1CategoriesHandler } from './queries/get-products-with-level1-categories/get-products-with-level1-categories.query.handler'
import { GetVariantsBatchHandler } from './queries/get-variants-batch/get-variants-batch.query.handler'
import { GetDescendantCategoryIdsHandler } from './queries/get-descendant-category-ids/get-descendant-category-ids.query.handler'
import { SagaValidateItemsHandler } from './commands/saga-validate-items/saga-validate-items.command.handler'
import { CreateProductReviewHandler } from './commands/create-product-review/create-product-review.command.handler'
import { CreateReviewReportHandler } from './commands/create-review-report/create-review-report.command.handler'
import { GetReviewedOrderItemsHandler } from './queries/get-reviewed-order-items/get-reviewed-order-items.query.handler'

const CommandHandlers = [
  CreateCategoryHandler,
  UploadProductImageHandler,
  CreateProductHandler,
  UploadProductVideoHandler,
  UpdateProductHandler,
  CreateBrandHandler,
  DeleteBrandHandler,
  UpdateBrandHandler,
  UploadBrandLogoHandler,
  ApproveProductHandler,
  RejectProductHandler,
  HideProductHandler,
  UnhideProductHandler,
  SoftDeleteProductHandler,
  SagaValidateItemsHandler,
  CreateProductReviewHandler,
  CreateReviewReportHandler,
]

const QueryHandlers = [
  GetCategoriesHandler,
  GetShopProductsPaginatedHandler,
  GetCategoryHandler,
  GetProductWithVariantsHandler,
  GetBrandsPaginatedHandler,
  GetRootCategoriesHandler,
  GetProductsPaginatedHandler,
  GetProductReviewsPaginatedHandler,
  GetProductToSoldHandler,
  GetVariantInfoHandler,
  GetProductsWithLevel1CategoriesHandler,
  GetVariantsBatchHandler,
  GetDescendantCategoryIdsHandler,
  GetReviewedOrderItemsHandler,
]

const EventHandlers = [
  ProductCreatedEventHandler,
  ProductUpdatedEventHandler,
]
 
@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    MessagingModule,
    ElasticsearchModule,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    CloudinaryService
  ],
  exports: [],
})
export class ApplicationModule {}
