import { z } from 'zod';
export const planStatusSchema = z.enum(['draft', 'active', 'completed']);
const fields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2000),
  weeklyMinutes: z.number().int().min(15).max(1200),
};
export const createStudyPlanSchema = z
  .object({
    ...fields,
    slug: z
      .string()
      .min(3)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();
export const replaceStudyPlanSchema = z.object({ ...fields, status: planStatusSchema }).strict();
export const studyPlanIdSchema = z.string().uuid();
export const studyPlanQuerySchema = z
  .object({
    page: z
      .string()
      .regex(/^[1-9]\d*$/)
      .transform(Number)
      .pipe(z.number().max(10000))
      .default(1),
    limit: z
      .string()
      .regex(/^[1-9]\d*$/)
      .transform(Number)
      .pipe(z.number().max(100))
      .default(20),
    status: planStatusSchema.optional(),
  })
  .strict();
export const studyPlanSchema = z.object({
  ...fields,
  id: studyPlanIdSchema,
  ownerId: z.string(),
  slug: z.string(),
  status: planStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const studyPlanResponseSchema = z.object({
  data: studyPlanSchema,
  meta: z.object({ requestId: z.string() }),
});
export const studyPlanListResponseSchema = z.object({
  data: z.array(studyPlanSchema),
  meta: z.object({ requestId: z.string(), page: z.number(), limit: z.number() }),
});
export type StudyPlan = z.infer<typeof studyPlanSchema>;
