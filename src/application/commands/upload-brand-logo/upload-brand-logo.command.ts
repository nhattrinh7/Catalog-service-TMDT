import { ICommand } from '@nestjs/cqrs'

export class UploadBrandLogoCommand implements ICommand {
  constructor(
    public readonly file: Express.Multer.File,
  ) {}
}
