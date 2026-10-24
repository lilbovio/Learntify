import { z } from 'zod';
export const socialProviderSchema = z.enum(['google', 'github']);
export const socialRequestSchema = z
  .object({ provider: socialProviderSchema, locale: z.enum(['en', 'es']) })
  .strict();
export const socialProvidersResponseSchema = z.object({ providers: z.array(socialProviderSchema) });
export const socialRedirectSchema = z.object({ url: z.string().url() });

export const signInRequestSchema = z
  .object({
    email: z.string().email().max(254),
    metadata: z.object({ adultConfirmed: z.literal(true) }).strict(),
    callbackURL: z.enum(['/', '/?lang=en', '/?lang=es', '/en/today', '/es/today']).optional(),
    newUserCallbackURL: z.enum(['/en/start', '/es/start']).optional(),
    errorCallbackURL: z.enum(['/en/auth', '/es/auth']).optional(),
  })
  .strict();
export const accountResponseSchema = z.object({
  data: z.object({ id: z.string(), name: z.string() }),
  meta: z.object({ requestId: z.string() }),
});
export const deleteAccountSchema = z.object({ confirmation: z.literal('DELETE') }).strict();
export const revokeSessionsResponseSchema = z.object({ status: z.literal(true) });
export const deleteAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.literal('User deleted'),
});
export const capabilitiesResponseSchema = z.object({
  data: z.object({
    accounts: z.boolean(),
    cloudDrafts: z.boolean(),
    preferences: z.boolean(),
    accountDeletion: z.boolean(),
  }),
  meta: z.object({ requestId: z.string() }),
});

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
export const preferencesSchema = z
  .object({
    locale: localeSchema,
    goal: z.enum(['foundations', 'projects', 'interviews']),
    weeklyMinutes: z.union([z.literal(60), z.literal(180), z.literal(300), z.null()]),
  })
  .strict();
export type LearningPreferences = z.infer<typeof preferencesSchema>;
export const preferencesResponseSchema = z.object({
  data: preferencesSchema.nullable(),
  meta: z.object({ requestId: z.string() }),
});
export const openDraftSchema = z
  .object({ lessonId: z.string().min(1).max(100), lessonVersion: z.number().int().positive() })
  .strict();
export const draftResponseSchema = z.object({
  data: z.object({ id: z.string(), content: z.string(), revision: z.number().int().positive() }),
  meta: z.object({ requestId: z.string() }),
});
export type LessonDraft = z.infer<typeof draftResponseSchema>['data'];
export const savedDraftResponseSchema = z.object({
  data: z.object({ revision: z.number().int().positive() }),
  meta: z.object({ requestId: z.string() }),
});
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
