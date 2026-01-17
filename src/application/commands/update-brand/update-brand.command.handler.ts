import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UpdateBrandCommand } from '~/application/commands/update-brand/update-brand.command'
import { BRAND_REPOSITORY, type IBrandRepository } from '~/domain/repositories/brand.repository.interface'
import { Inject, NotFoundException } from '@nestjs/common'

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandHandler implements ICommandHandler<UpdateBrandCommand, void> {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(command: UpdateBrandCommand) {
    const { id, body } = command

    const brand = await this.brandRepository.findById(id)
    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`)
    }

    brand.update(body)

    await this.brandRepository.update(brand)
  }
}
