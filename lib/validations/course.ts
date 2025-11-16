import { z } from 'zod'

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  embedUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  accessType: z.enum(['FREE', 'PAID']),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().default('usd'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  visibility: z.enum(['PRIVATE', 'PUBLIC']),
})

export type CourseInput = z.infer<typeof courseSchema>
