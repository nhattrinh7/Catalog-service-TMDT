import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const CreateReviewReportBodySchema = z.object({
  reason: z.enum(['VULGAR', 'ADULT_CONTENT', 'SPAM', 'PERSONAL_INFO', 'ILLEGAL_ADVERTISING', 'FALSE_INFORMATION', 'OTHER']),
  description: z.string().optional(),
})
export class CreateReviewReportBodyDto extends createZodDto(CreateReviewReportBodySchema) {}
