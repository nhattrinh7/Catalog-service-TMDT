import {
  Controller,
  Param,
  Patch,
  Headers,
  Body,
  Post,
  Get,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreateCategoryCommand } from '~/application/commands/create-category/create-category.command'
import { GetCategoriesQuery } from '~/application/queries/get-categories/get-categories.query'
import { GetCategoryQuery } from '~/application/queries/get-category/get-category.query'
import { GetRootCategoriesQuery } from '~/application/queries/get-root-categories/get-root-categories.query'
import { CreateCategoryBodyDto } from '~/presentation/dtos/category.dto'


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
  async getCategories(): Promise<any> {
    const categories = await this.queryBus.execute(new GetCategoriesQuery())

    return { message: 'Get categories successful', data: categories }
  }

  @Get('/root')
  async getRootCategories(): Promise<any> {
    const categories = await this.queryBus.execute(new GetRootCategoriesQuery())

    return { message: 'Get root categories successful', data: categories }
  }

  @Get('/:id')
  async getCategory(
    @Param('id') id: string
  ): Promise<any> {
    const category = await this.queryBus.execute(new GetCategoryQuery(id))

    return { message: 'Get category successful', data: category }
  }

}
  