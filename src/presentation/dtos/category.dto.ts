import { createZodDto } from 'nestjs-zod'
import z from 'zod'

// const AttributeDefinitionSchema = z.object({
//   name: z.string().min(1, 'Attribute name is required'),
//   label: z.string().min(1, 'Attribute label is required'),
// })

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  parentId: z.uuid().nullable(),
  attributes: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class CategoryDto extends createZodDto(CategorySchema) {}


export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  description: true,
  parentId: true,
  attributes: true,
})
export class CreateCategoryBodyDto extends createZodDto(CreateCategoryBodySchema) {}