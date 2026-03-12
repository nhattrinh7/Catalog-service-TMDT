import {
  Controller,
  Param,
  Get,
  Post,
  Query,
  Body,
  Headers,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { GetProductReviewsPaginatedQuery } from '~/application/queries/get-product-reviews-paginated/get-product-reviews-paginated.query'
import { CreateProductReviewCommand } from '~/application/commands/create-product-review/create-product-review.command'
import { GetProductReviewsPaginatedQueryDto, CreateProductReviewBodyDto } from '~/presentation/dtos/product-review.dto'

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
}
