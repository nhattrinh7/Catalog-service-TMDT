import { Module } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { BRAND_REPOSITORY } from '~/domain/repositories/brand.repository.interface'
import { CATEGORY_REPOSITORY } from '~/domain/repositories/category.repository.interface'
import { PRODUCT_REPOSITORY } from '~/domain/repositories/product.repository.interface'
import { PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { OPTION_REPOSITORY } from '~/domain/repositories/option.repository.interface'
import { OPTION_VALUE_REPOSITORY } from '~/domain/repositories/option-value.repository.interface'
import { PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY } from '~/domain/repositories/product-variant-option-value.repository.interface'
import { REVIEW_REPORT_REPOSITORY } from '~/domain/repositories/review-report.repository.interface'
import { REVIEW_REPLY_REPOSITORY } from '~/domain/repositories/review-reply.repository.interface'
import { BrandRepository } from '~/infrastructure/database/repositories/brand.repository'
import { CategoryRepository } from '~/infrastructure/database/repositories/category.repository'
import { ProductRepository } from '~/infrastructure/database/repositories/product.repository'
import { ProductVariantRepository } from '~/infrastructure/database/repositories/product-variant.repository'
import { OptionRepository } from '~/infrastructure/database/repositories/option.repository'
import { OptionValueRepository } from '~/infrastructure/database/repositories/option-value.repository'
import { ProductVariantOptionValueRepository } from '~/infrastructure/database/repositories/product-variant-option-value.repository'
import { ReviewReportRepository } from '~/infrastructure/database/repositories/review-report.repository'
import { ReviewReplyRepository } from '~/infrastructure/database/repositories/review-reply.repository'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
  imports: [CqrsModule],
  providers: [
    PrismaService,
    {
      provide: BRAND_REPOSITORY,
      useClass: BrandRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: PRODUCT_VARIANT_REPOSITORY,
      useClass: ProductVariantRepository,
    },
    {
      provide: OPTION_REPOSITORY,
      useClass: OptionRepository,
    },
    {
      provide: OPTION_VALUE_REPOSITORY,
      useClass: OptionValueRepository,
    },
    {
      provide: PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY,
      useClass: ProductVariantOptionValueRepository,
    },
    {
      provide: REVIEW_REPORT_REPOSITORY,
      useClass: ReviewReportRepository,
    },
    {
      provide: REVIEW_REPLY_REPOSITORY,
      useClass: ReviewReplyRepository,
    },
  ],
  exports: [
    PrismaService,
    BRAND_REPOSITORY,
    CATEGORY_REPOSITORY,
    PRODUCT_REPOSITORY,
    PRODUCT_VARIANT_REPOSITORY,
    OPTION_REPOSITORY,
    OPTION_VALUE_REPOSITORY,
    PRODUCT_VARIANT_OPTION_VALUE_REPOSITORY,
    REVIEW_REPORT_REPOSITORY,
    REVIEW_REPLY_REPOSITORY,
  ],
})
export class DatabaseModule {}

