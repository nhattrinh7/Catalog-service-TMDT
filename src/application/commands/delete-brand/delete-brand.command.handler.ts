import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeleteBrandCommand } from '~/application/commands/delete-brand/delete-brand.command'
import { BRAND_REPOSITORY, type IBrandRepository } from '~/domain/repositories/brand.repository.interface'
import { Inject } from '@nestjs/common'

@CommandHandler(DeleteBrandCommand)
export class DeleteBrandHandler implements ICommandHandler<DeleteBrandCommand, void> {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(command: DeleteBrandCommand) {
    const { id } = command
    await this.brandRepository.delete(id)
  }
}
