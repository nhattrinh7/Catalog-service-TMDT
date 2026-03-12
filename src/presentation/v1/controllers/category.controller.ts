import {
  Controller,
  Param,
  Body,
  Post,
  Get,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CacheTTL } from '@nestjs/cache-manager'
import { CreateCategoryCommand } from '~/application/commands/create-category/create-category.command'
import { GetCategoriesQuery } from '~/application/queries/get-categories/get-categories.query'
import { GetCategoryQuery } from '~/application/queries/get-category/get-category.query'
import { GetRootCategoriesQuery } from '~/application/queries/get-root-categories/get-root-categories.query'
import { CreateCategoryBodyDto } from '~/presentation/dtos/category.dto'
import { CustomCacheInterceptor } from '~/infrastructure/cache/custom-cache.interceptor'
import { CacheType } from '~/infrastructure/cache/cache-type.decorator'
import { CacheResource } from '~/infrastructure/cache/cache-prefix.decorator'
import { CACHE_TYPE, CACHE_RESOURCE } from '~/common/constants/cache.constant'

@Controller('v1/categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  async createCategory(@Body() body: CreateCategoryBodyDto): Promise<any> {
    const category = await this.commandBus.execute(new CreateCategoryCommand(body))

    return { message: 'Create category successful', data: category }
  }

  @Get('/')
  @UseInterceptors(CustomCacheInterceptor)
  @CacheType(CACHE_TYPE.LIST)
  @CacheResource(CACHE_RESOURCE.CATEGORIES)
  @CacheTTL(3_600_000) // 1 giờ
  async getCategories(): Promise<any> {
    const categories = await this.queryBus.execute(new GetCategoriesQuery())

    return { message: 'Get categories successful', data: categories }
  }

  @Get('/root')
  @UseInterceptors(CustomCacheInterceptor)
  @CacheType(CACHE_TYPE.LIST)
  @CacheResource(CACHE_RESOURCE.CATEGORIES_ROOT)
  @CacheTTL(3_600_000) // 1 giờ
  async getRootCategories(): Promise<any> {
    const categories = await this.queryBus.execute(new GetRootCategoriesQuery())

    return { message: 'Get root categories successful', data: categories }
  }

  @Get('/:id')
  @UseInterceptors(CustomCacheInterceptor)
  @CacheType(CACHE_TYPE.DETAIL)
  @CacheResource(CACHE_RESOURCE.CATEGORIES)
  @CacheTTL(3_600_000) // 1 giờ
  async getCategory(
    @Param('id') id: string
  ): Promise<any> {
    const category = await this.queryBus.execute(new GetCategoryQuery(id))

    return { message: 'Get category successful', data: category }
  }

}
  