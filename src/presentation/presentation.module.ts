import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CategoryController } from '~/presentation/v1/controllers/category.controller'
import { BrandController } from '~/presentation/v1/controllers/brand.controller'
import { ApplicationModule } from '~/application/application.module'
import { MessagingModule } from '~/infrastructure/messaging/messaging.module'
import { ProductController } from '~/presentation/v1/controllers/product.controller'
import { ProductReviewController } from '~/presentation/v1/controllers/product-review.controller'
import { ReportReviewController } from '~/presentation/v1/controllers/report-review.controller'

@Module({
  imports: [CqrsModule, ApplicationModule, MessagingModule],
  controllers: [CategoryController, BrandController, ProductController, ProductReviewController, ReportReviewController],
  exports: [],
})
export class PresentationModule {}
