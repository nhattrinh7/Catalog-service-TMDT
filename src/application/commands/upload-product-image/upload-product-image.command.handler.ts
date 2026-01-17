import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UploadProductImageCommand } from '~/application/commands/upload-product-image/upload-product-image.command'
import { CloudinaryService } from '~/common/services/cloudinary.service'

@CommandHandler(UploadProductImageCommand)
export class UploadProductImageHandler implements ICommandHandler<UploadProductImageCommand, string> {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UploadProductImageCommand) {
    const { file } = command

    // Upload ảnh lên Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImageToCloudinary(file, 'product-image')

    return uploadResult.secure_url
  }
}
  