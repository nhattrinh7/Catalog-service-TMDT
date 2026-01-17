import { Module } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { BRAND_REPOSITORY } from '~/domain/repositories/brand.repository.interface'
import { CATEGORY_REPOSITORY } from '~/domain/repositories/category.repository.interface'
import { PRODUCT_REPOSITORY } from '~/domain/repositories/product.repository.interface'
import { PRODUCT_VARIANT_REPOSITORY } from '~/domain/repositories/product-variant.repository.interface'
import { BrandRepository } from '~/infrastructure/database/repositories/brand.repository'
import { CategoryRepository } from '~/infrastructure/database/repositories/category.repository'
import { ProductRepository } from '~/infrastructure/database/repositories/product.repository'
import { ProductVariantRepository } from '~/infrastructure/database/repositories/product-variant.repository'
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
  ],
  exports: [
    BRAND_REPOSITORY,
    CATEGORY_REPOSITORY,
    PRODUCT_REPOSITORY,
    PRODUCT_VARIANT_REPOSITORY
  ],
})
export class DatabaseModule {}
