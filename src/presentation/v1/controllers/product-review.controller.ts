import {
  Controller,
  Param,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { GetProductReviewsPaginatedQuery } from '~/application/queries/get-product-reviews-paginated/get-product-reviews-paginated.query'
import { CreateProductReviewCommand } from '~/application/commands/create-product-review/create-product-review.command'
import { GetProductReviewsPaginatedQueryDto, CreateProductReviewBodyDto, GetShopReviewsPaginatedQueryDto, GetReportedReviewsPaginatedQueryDto } from '~/presentation/dtos/product-review.dto'
import { GetShopReviewsPaginatedQuery } from '~/application/queries/get-shop-reviews-paginated/get-shop-reviews-paginated.query'
import { GetReportedReviewsPaginatedQuery } from '~/application/queries/get-reported-reviews-paginated/get-reported-reviews-paginated.query'
import { HideProductReviewCommand } from '~/application/commands/hide-product-review/hide-product-review.command'

@Controller('v1/products')
export class ProductReviewController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/:id/reviews')
  async getProductReviewPaginated(
    @Query() query: GetProductReviewsPaginatedQueryDto,
    @Param('id') id: string,
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetProductReviewsPaginatedQuery(
      id,
      query.page,
      query.limit,
      query.rating,
      query.hasMedia,
    ))

    return { message: 'Get product reviews paginated successful', data: result}
  }

  @Post('/:id/reviews')
  async createProductReview(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateProductReviewBodyDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new CreateProductReviewCommand(id, userId, body))

    return { message: 'Create product review successful' }
  }

  @Get('/shop/:shopId/reviews')
  async getShopReviewsPaginated(
    @Param('shopId') shopId: string,
    @Query() query: GetShopReviewsPaginatedQueryDto,
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetShopReviewsPaginatedQuery(
      query.page,
      query.limit,
      shopId,
      query.ratings,
      query.search,
      query.startDate,
      query.endDate,
    ))

    return { message: 'Get shop reviews paginated successful', data: result }
  }

  @Get('/reviews/reported')
  async getReportedReviewsPaginated(
    @Query() query: GetReportedReviewsPaginatedQueryDto,
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetReportedReviewsPaginatedQuery(
      query.page,
      query.limit,
      query.isHidden,
    ))

    return { message: 'Get reported reviews paginated successful', data: result }
  }

  @Patch('/reviews/:id/hide')
  async hideReview(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new HideProductReviewCommand(id))

    return { message: 'Hide review successful' }
  }
}
