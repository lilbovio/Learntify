import { z } from 'zod';

export const saveDraftSchema = z
  .object({
    content: z.string().max(16000),
    expectedRevision: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER - 1),
    operationId: z.string().uuid(),
  })
  .strict();

export const localeSchema = z.enum(['en', 'es']);
export type Locale = z.infer<typeof localeSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  locale: localeSchema,
  title: z.string(),
  objective: z.string(),
  explanation: z.array(z.string()).min(1),
  example: z.string(),
  exercise: z.object({
    id: z.string(),
    prompt: z.string(),
    choices: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
  }),
});
export type Lesson = z.infer<typeof lessonSchema>;
export const lessonResponseSchema = z.object({
  data: lessonSchema,
  meta: z.object({ requestId: z.string() }),
});
export const predictionSchema = z
  .object({
    locale: localeSchema,
    lessonVersion: z.number().int().positive(),
    choiceId: z.string().min(1).max(40),
  })
  .strict();
export const predictionResponseSchema = z.object({
  data: z.object({
    correct: z.boolean(),
    explanation: z.string(),
    nextStep: z.string(),
    provenance: z.literal('practice-feedback'),
  }),
  meta: z.object({ requestId: z.string() }),
});
export type PredictionFeedback = z.infer<typeof predictionResponseSchema>['data'];
export const lessonListItemSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  title: z.string().min(1),
});

export const lessonListResponseSchema = z.object({
  data: z.array(lessonListItemSchema),
  meta: z.object({ requestId: z.string() }),
});

export type LessonListItem = z.infer<typeof lessonListItemSchema>;

export const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
  meta: z.object({ requestId: z.string() }),
});
