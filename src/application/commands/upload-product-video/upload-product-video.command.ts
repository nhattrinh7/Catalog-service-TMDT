import { ICommand } from '@nestjs/cqrs'

export class UploadProductVideoCommand implements ICommand {
  constructor(
    public readonly file: Express.Multer.File,
  ) {}
}
  