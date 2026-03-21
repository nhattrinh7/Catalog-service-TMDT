import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const CreateReviewReplyBodySchema = z.object({
  shopId: z.uuid(),
  content: z.string().min(1).max(500),
})

export class CreateReviewReplyBodyDto extends createZodDto(CreateReviewReplyBodySchema) {}
