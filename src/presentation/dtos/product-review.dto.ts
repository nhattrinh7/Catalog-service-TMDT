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

export const CreateProductReviewBodySchema = z.object({
  orderId: z.uuid(),
  buyerUsername: z.string().min(1).max(100),
  buyerAvatar: z.string().nullable().optional(),
  productName: z.string().min(1).max(255),
  sku: z.string().max(30),
  rating: z.number().int().min(1).max(5),
  content: z.string().optional(),
  images: z.array(z.url()).max(3).optional(),
  video: z.url().optional(),
})
export class CreateProductReviewBodyDto extends createZodDto(CreateProductReviewBodySchema) {}

const RatingsSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'string') return undefined
    const trimmed = val.trim()
    if (!trimmed) return undefined
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item))
  },
  z.array(z.number().int().min(1).max(5)).optional(),
)

const DateStringSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'string') return undefined
    const trimmed = val.trim()
    return trimmed ? trimmed : undefined
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
)

export const GetShopReviewsPaginatedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5))
    .pipe(z.number().int().positive().max(50)),

  search: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  ratings: RatingsSchema,

  startDate: DateStringSchema,
  endDate: DateStringSchema,
})
export class GetShopReviewsPaginatedQueryDto extends createZodDto(GetShopReviewsPaginatedQuerySchema) {}

export const GetReportedReviewsPaginatedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(50)),

  isHidden: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined
      if (val === 'true') return true
      if (val === 'false') return false
      return undefined
    })
    .pipe(z.boolean().optional()),
})
export class GetReportedReviewsPaginatedQueryDto extends createZodDto(GetReportedReviewsPaginatedQuerySchema) {}
