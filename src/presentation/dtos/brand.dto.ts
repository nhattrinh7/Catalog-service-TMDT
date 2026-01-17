import { createZodDto } from 'nestjs-zod'
import z from 'zod'


export const BrandSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  logo: z.url(),
  country: z.string().min(2).max(50),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class BrandDto extends createZodDto(BrandSchema) {}

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  description: true,
  logo: true,
  country: true,
})
export class CreateBrandBodyDto extends createZodDto(CreateBrandBodySchema) {}

export const UpdateBrandBodySchema = BrandSchema.pick({
  name: true,
  description: true,
  logo: true,
  country: true,
}).partial() // partial() có nghĩa là tất cả các trường đều là optional
export class UpdateBrandBodyDto extends createZodDto(UpdateBrandBodySchema) {}

export const GetBrandsPaginatedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)) // chuyển kiểu dữ liệu sang int, nếu không có giá trị thì mặc định là 1
    .pipe(z.number().int().positive()), // xác thực lại sau khi chuyển kiểu dữ liệu
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(10)),
  
  search: z
    .string()
    .optional()
    .transform((val) => val || undefined),
})
export class GetBrandsPaginatedQueryDto extends createZodDto(GetBrandsPaginatedQuerySchema) {}