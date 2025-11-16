import { z } from 'zod'

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  price: z.number().min(0).optional().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().optional().default(false),
  level: z.string().optional(),
  duration: z.number().int().min(0).optional(), // Duration in minutes
  categoryId: z.string().optional(),
  instructorId: z.string().optional(), // Will be set from session if not provided
})

export type CourseInput = z.infer<typeof courseSchema>
