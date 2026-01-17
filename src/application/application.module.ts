import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { DatabaseModule } from '~/infrastructure/database/database.module'
import { MessagingModule } from '~/infrastructure/messaging/messaging.module'
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
]

const QueryHandlers = [
  GetCategoriesHandler,
  GetShopProductsPaginatedHandler,
  GetCategoryHandler,
  GetProductWithVariantsHandler,
  GetBrandsPaginatedHandler,
]

const EventHandlers = [
  ProductCreatedEventHandler,
  ProductUpdatedEventHandler,
]
 
@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    MessagingModule
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