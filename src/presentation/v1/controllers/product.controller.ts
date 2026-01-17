import {
  Controller,
  Param,
  Patch,
  Headers,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Query,
  Put,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateProductCommand } from '~/application/commands/create-product/create-product.command'
import { UpdateProductCommand } from '~/application/commands/update-product/update-product.command'
import { UploadProductImageCommand } from '~/application/commands/upload-product-image/upload-product-image.command'
import { UploadProductVideoCommand } from '~/application/commands/upload-product-video/upload-product-video.command'
import { GetProductWithVariantsQuery } from '~/application/queries/get-product-with-variants/get-product-with-variants.query'
import { GetShopProductsPaginatedQuery } from '~/application/queries/get-shop-products-paginated/get-shop-products-paginated.query'
import { CreateProductBodyDto, GetProductsPaginatedQueryDto, UpdateProductBodyDto } from '~/presentation/dtos/product.dto'


@Controller('v1/products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('product-image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    const url = await this.commandBus.execute(new UploadProductImageCommand(file))

    return { message: 'Upload product image successful', data: { url } }
  }

  @Post('/upload-video')
  @UseInterceptors(FileInterceptor('product-video'))
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(mp4)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    const url = await this.commandBus.execute(new UploadProductVideoCommand(file))

    return { message: 'Upload product video successful', data: { url } }
  }

  @Post('/')
  async createProduct(
    @Body() body: CreateProductBodyDto,
  ): Promise<any> {
    await this.commandBus.execute(new CreateProductCommand(body))

    return { message: 'Create product successful' }
  }

  // API lấy sản phẩm của 1 shop cụ thể
  @Get('/')
  async getShopProductsPaginated(
    @Query() query: GetProductsPaginatedQueryDto,
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetShopProductsPaginatedQuery(
      query.page,
      query.limit,
      query.shopId, // Zod DTO đã validate shopId là bắt buộc
      query.search,
      query.isActive,
      query.approveStatus,
    ))

    return { message: 'Get shop products paginated successful', data: result}
  }

  @Get('/:id')
  async getProductDetail(
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.queryBus.execute(new GetProductWithVariantsQuery(id))

    return { message: 'Get product detail successful', data: result}
  }

  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductBodyDto,
  ): Promise<any> {
    await this.commandBus.execute(new UpdateProductCommand(id, body))

    return { message: 'Update product successful' }
  }

}
