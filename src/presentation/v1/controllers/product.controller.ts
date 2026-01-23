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
import { ApproveProductCommand } from '~/application/commands/approve-product/approve-product.command'
import { RejectProductCommand } from '~/application/commands/reject-product/reject-product.command'
import { HideProductCommand } from '~/application/commands/hide-product/hide-product.command'
import { UnhideProductCommand } from '~/application/commands/unhide-product/unhide-product.command'
import { GetProductWithVariantsQuery } from '~/application/queries/get-product-with-variants/get-product-with-variants.query'
import { GetShopProductsPaginatedQuery } from '~/application/queries/get-shop-products-paginated/get-shop-products-paginated.query'
import { GetProductsPaginatedQuery } from '~/application/queries/get-products-paginated/get-products-paginated.query'
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
  @Get('/shop/:shopId')
  async getShopProductsPaginated(
    @Query() query: GetProductsPaginatedQueryDto,
    @Param('shopId') shopId: string,
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetShopProductsPaginatedQuery(
      query.page,
      query.limit,
      shopId,
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

  @Patch('/:id/hide')
  async hideProduct(
    @Param('id') id: string,
  ): Promise<any> {
    await this.commandBus.execute(new HideProductCommand(id))

    return { message: 'Hide product successful' }
  }

  @Patch('/:id/unhide')
  async unhideProduct(
    @Param('id') id: string,
  ): Promise<any> {
    await this.commandBus.execute(new UnhideProductCommand(id))

    return { message: 'Unhide product successful' }
  }

  // ADMIN MỚI ĐƯỢC DÙNG
  @Get('/')
  async getProductsPaginated(
    @Query() query: GetProductsPaginatedQueryDto,
    @Headers('x-user-role') roleId: string, // roleId của admin
  ): Promise<{ message: string, data: any }> {
    const result = await this.queryBus.execute(new GetProductsPaginatedQuery(
      query.page,
      query.limit,
      query.search,
      query.approveStatus,
      roleId
    ))

    return { message: 'Get products paginated successful', data: result}
  }
  
  @Patch('/:id/approve')
  async approveProduct(
    @Param('id') id: string,
  ): Promise<any> {
    await this.commandBus.execute(new ApproveProductCommand(id))

    return { message: 'Approve product successful' }
  }

  @Patch('/:id/reject')
  async rejectProduct(
    @Param('id') id: string,
    @Body() body: { rejectReason: string },
  ): Promise<any> {
    await this.commandBus.execute(new RejectProductCommand(id, body.rejectReason))

    return { message: 'Reject product successful' }
  }

}
