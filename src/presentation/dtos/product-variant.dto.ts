import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const ProductVariantSchema = z.object({
  id: z.uuid(),
  productId: z.string().min(1).max(255),
  sku: z.string().min(1).max(255),
  price: z.number().positive(),
  image: z.url(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class ProductVariantDto extends createZodDto(ProductVariantSchema) {}

export const CreateProductVariantSchema = ProductVariantSchema.pick({
  productId: true,
  sku: true,
  price: true,
  image: true,
})
export class CreateProductVariantDto extends createZodDto(CreateProductVariantSchema) {}