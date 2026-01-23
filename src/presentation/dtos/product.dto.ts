import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { ApproveProductStatus } from '~/domain/enums/product.enum'

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  descriptions: z.string().max(2000),
  attributes: z.record(z.string(), z.string()),
  shopId: z.uuid(),
  categoryId: z.uuid(),
  mainImage: z.url(),
  galleryImage: z.array(z.url()),
  video: z.url().nullable(),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().min(0),
  unit: z.string().max(50),
  isActive: z.boolean(),
  approveStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  rejectReason: z.string().max(500).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class ProductDto extends createZodDto(ProductSchema) {}

export const CreateProductSchema = ProductSchema.pick({
  name: true,
  descriptions: true,
  attributes: true,
  shopId: true,
  categoryId: true,
  mainImage: true,
  galleryImage: true,
  video: true,
  unit: true,
})
export class CreateProductEntityDto extends createZodDto(CreateProductSchema) {}
// Schema cho classification (option và values của nó)
export const ClassificationSchema = z.object({
  name: z.string().min(1).max(30),
  values: z.array(z.string().min(1).max(30)).min(1),
})

export const CreateProductBodySchema = CreateProductSchema.extend({
  classifications: z.array(ClassificationSchema).optional(),
  variants: z.array(
    z.object({
      image: z.url(),
      price: z.number().min(0),
      sku: z.string().max(100),
      stock: z.number().min(0),
      optionValues: z.array(z.string().max(30)).optional(),
    })
  )
})
export class CreateProductBodyDto extends createZodDto(CreateProductBodySchema) {}

export const UpdateProductSchema = ProductSchema.pick({
  name: true,
  descriptions: true,
  attributes: true,
  mainImage: true,
  galleryImage: true,
  video: true,
  unit: true,
})
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
export const UpdateProductBodySchema = UpdateProductSchema.extend({
  variants: z.array(
    z.object({
      id: z.uuid(),
      image: z.url(),
      price: z.number().min(0),
      sku: z.string().max(100),
      stock: z.number().min(0),
    })
  )
})
export class UpdateProductBodyDto extends createZodDto(UpdateProductBodySchema) {}

export const GetProductsPaginatedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)) // chuyển kiểu dữ liệu sang int, nếu không có giá trị thì mặc định là 1
    .pipe(z.number().int().positive()), // xác thực lại sau khi chuyển kiểu dữ liệu
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5))
    .pipe(z.number().int().positive().max(10)),
  
  search: z
    .string()
    .optional()
    .transform((val) => val || undefined), // "laptop" → "laptop", "" → undefined, undefined → undefined
    // lí do mà "" → undefined là vì nếu ko muốn search thì đã ko cần truyền search vào url, đã search thì phải có giá trị
    // đằng này lại truyền search="" để làm quái gì, coi như ko truyền search vào cho rồi
  
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return val === 'true'
    })
    .pipe(z.boolean().optional()),
  
  approveStatus: z
    .enum(ApproveProductStatus)
    .optional(),
})
export class GetProductsPaginatedQueryDto extends createZodDto(GetProductsPaginatedQuerySchema) {}

// ===== Response DTOs for Pagination =====

export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0),
})
export class PaginationMetaDto extends createZodDto(PaginationMetaSchema) {}

export const ProductVariantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  sku: z.string().max(100),
  price: z.number().min(0),
  image: z.url(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class ProductVariantDto extends createZodDto(ProductVariantSchema) {}

export const ProductWithVariantsSchema = ProductSchema.extend({
  variants: z.array(ProductVariantSchema),
})
export class ProductWithVariantsDto extends createZodDto(ProductWithVariantsSchema) {}

export const GetProductsPaginatedResponseSchema = z.object({
  items: z.array(ProductWithVariantsSchema),
  meta: PaginationMetaSchema,
})
export class GetProductsPaginatedResponseDto extends createZodDto(GetProductsPaginatedResponseSchema) {}
