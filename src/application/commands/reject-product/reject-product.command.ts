import { ICommand } from '@nestjs/cqrs'

export class RejectProductCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly rejectReason: string,
  ) {}
}
