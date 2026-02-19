import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const GetProductReviewsPaginatedQuerySchema = z.object({
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
  
  rating: z
    .string()
    .optional()
    .transform((val) => val || undefined), // "laptop" → "laptop", "" → undefined, undefined → undefined
    // lí do mà "" → undefined là vì nếu ko muốn search thì đã ko cần truyền search vào url, đã search thì phải có giá trị
    // đằng này lại truyền search="" để làm quái gì, coi như ko truyền search vào cho rồi
  
  hasMedia: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return val === 'true'
    })
    .pipe(z.boolean().optional()),
  
})
export class GetProductReviewsPaginatedQueryDto extends createZodDto(GetProductReviewsPaginatedQuerySchema) {}