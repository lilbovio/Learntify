import {
  apiErrorSchema,
  lessonListResponseSchema,
  lessonResponseSchema,
  predictionResponseSchema,
  type Locale,
} from '@learntify/api-contracts';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

async function read(response: Response): Promise<unknown> {
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = apiErrorSchema.safeParse(body);
    throw new ApiError(error.success ? error.data.error.code : 'INVALID_RESPONSE', response.status);
  }
  return body;
}

export function createApiClient(fetcher: typeof fetch = fetch) {
  return {
    async listLessons(locale: Locale, signal?: AbortSignal) {
      const response = await fetcher('/api/v1/lessons?locale=' + locale, signal ? { signal } : {});
      return lessonListResponseSchema.parse(await read(response)).data;
    },
    async getLesson(id: string, locale: Locale, signal?: AbortSignal) {
      const response = await fetcher(
        '/api/v1/lessons/' + encodeURIComponent(id) + '?locale=' + locale,
        signal ? { signal } : {},
      );
      return lessonResponseSchema.parse(await read(response)).data;
    },
    async predict(id: string, locale: Locale, lessonVersion: number, choiceId: string) {
      const response = await fetcher('/api/v1/lessons/' + encodeURIComponent(id) + '/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, lessonVersion, choiceId }),
      });
      return predictionResponseSchema.parse(await read(response)).data;
    },
  };
}

export type { Lesson, LessonListItem, Locale, PredictionFeedback } from '@learntify/api-contracts';
