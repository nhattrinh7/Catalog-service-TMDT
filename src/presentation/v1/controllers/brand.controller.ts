import {
  Controller,
  Param,
  Patch,
  Headers,
  Body,
  Post,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateBrandCommand } from '~/application/commands/create-brand/create-brand.command'
import { DeleteBrandCommand } from '~/application/commands/delete-brand/delete-brand.command'
import { UpdateBrandCommand } from '~/application/commands/update-brand/update-brand.command'
import { UploadBrandLogoCommand } from '~/application/commands/upload-brand-logo/upload-brand-logo.command'
import { GetBrandsPaginatedQuery } from '~/application/queries/get-brands-paginated/get-brands-paginated.query'
import { CreateBrandBodyDto, GetBrandsPaginatedQueryDto, UpdateBrandBodyDto } from '~/presentation/dtos/brand.dto'


@Controller('v1/brands')
export class BrandController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  async createBrand(@Body() body: CreateBrandBodyDto): Promise<any> {
    await this.commandBus.execute(new CreateBrandCommand(body))

    return { message: 'Create brand successful' }
  }

  @Put('/:id')
  async updateBrand(
    @Param('id') id: string,
    @Body() body: UpdateBrandBodyDto,
  ): Promise<any> {
    await this.commandBus.execute(new UpdateBrandCommand(id, body))

    return { message: 'Update brand successful' }
  }

  @Post('/upload-logo')
  @UseInterceptors(FileInterceptor('brand-logo'))
  async uploadBrandLogo(
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
    const url = await this.commandBus.execute(new UploadBrandLogoCommand(file))

    return { message: 'Upload brand logo successful', data: url }
  }

  @Delete('/:id')
  async deleteBrand(@Param('id') id: string): Promise<any> {
    await this.commandBus.execute(new DeleteBrandCommand(id))

    return { message: 'Delete brand successful' }
  }

  @Get('/')
  async getBrandsPaginated(
    @Query() query: GetBrandsPaginatedQueryDto,
  ): Promise<any> {
    const result = await this.queryBus.execute(new GetBrandsPaginatedQuery(
      query.page,
      query.limit,
      query.search,
    ))

    return {
      message: 'Get brands paginated successful',
      data: result,
    }
  }
}
