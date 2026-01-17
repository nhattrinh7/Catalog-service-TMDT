import { ICommand } from '@nestjs/cqrs'

export class UploadProductImageCommand implements ICommand {
  constructor(
    public readonly file: Express.Multer.File,
  ) {}
}
  