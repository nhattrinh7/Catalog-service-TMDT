import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UploadBrandLogoCommand } from '~/application/commands/upload-brand-logo/upload-brand-logo.command'
import { CloudinaryService } from '~/common/services/cloudinary.service'

@CommandHandler(UploadBrandLogoCommand)
export class UploadBrandLogoHandler implements ICommandHandler<UploadBrandLogoCommand, string> {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UploadBrandLogoCommand) {
    const { file } = command

    const uploadResult = await this.cloudinaryService.uploadImageToCloudinary(file, 'brand-logo')

    return uploadResult.secure_url
  }
}
