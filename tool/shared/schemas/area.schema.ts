import { z } from 'zod';

export const areaSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Area name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#6366f1'),
  githubRepo: z.string().url().optional().nullable(),
  createdAt: z.number().int().positive().optional()
});

export const insertAreaSchema = areaSchema.omit({ id: true, createdAt: true });
export const updateAreaSchema = areaSchema.partial();

export type Area = z.infer<typeof areaSchema>;
export type InsertArea = z.infer<typeof insertAreaSchema>;
export type UpdateArea = z.infer<typeof updateAreaSchema>;
