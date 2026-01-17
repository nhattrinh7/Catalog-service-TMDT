import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UploadProductVideoCommand } from '~/application/commands/upload-product-video/upload-product-video.command'
import { CloudinaryService } from '~/common/services/cloudinary.service'

@CommandHandler(UploadProductVideoCommand)
export class UploadProductVideoHandler implements ICommandHandler<UploadProductVideoCommand, string> {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UploadProductVideoCommand) {
    const { file } = command

    // Upload video lên Cloudinary
    const uploadResult = await this.cloudinaryService.uploadVideoToCloudinary(file, 'product-video')

    return uploadResult.secure_url
  }
}
  