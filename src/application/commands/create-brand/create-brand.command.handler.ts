import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateBrandCommand } from '~/application/commands/create-brand/create-brand.command'
import { BRAND_REPOSITORY, type IBrandRepository } from '~/domain/repositories/brand.repository.interface'
import { Inject } from '@nestjs/common'
import { Brand } from '~/domain/entities/brand.entity'

@CommandHandler(CreateBrandCommand)
export class CreateBrandHandler implements ICommandHandler<CreateBrandCommand, Brand> {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(command: CreateBrandCommand) {
    const { body } = command

    const brand = Brand.create({
      name: body.name,
      description: body.description,
      logo: body.logo,
      country: body.country,
    })

    await this.brandRepository.create(brand)
    return brand
  }
}
