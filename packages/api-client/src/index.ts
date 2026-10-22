import {
  apiErrorSchema,
  accountResponseSchema,
  capabilitiesResponseSchema,
  signInRequestSchema,
  draftResponseSchema,
  savedDraftResponseSchema,
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
    async openDraft(lessonId: string, lessonVersion: number) {
      return draftResponseSchema.parse(
        await read(
          await fetcher('/api/v1/drafts/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId, lessonVersion }),
          }),
        ),
      ).data;
    },
    async getDraft(id: string) {
      return draftResponseSchema.parse(
        await read(await fetcher('/api/v1/drafts/' + encodeURIComponent(id))),
      ).data;
    },
    async saveDraft(input: {
      id: string;
      content: string;
      expectedRevision: number;
      operationId: string;
    }) {
      const { id, ...body } = input;
      return savedDraftResponseSchema.parse(
        await read(
          await fetcher('/api/v1/drafts/' + encodeURIComponent(id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }),
        ),
      ).data;
    },
    async capabilities(signal?: AbortSignal) {
      return capabilitiesResponseSchema.parse(
        await read(await fetcher('/api/v1/capabilities', signal ? { signal } : {})),
      ).data;
    },
    async currentAccount(signal?: AbortSignal) {
      const response = await fetcher('/api/v1/me', {
        credentials: 'same-origin',
        ...(signal ? { signal } : {}),
      });
      if (response.status === 401) return null;
      return accountResponseSchema.parse(await read(response)).data;
    },
    async requestSignIn(email: string, adultConfirmed: boolean, locale: Locale) {
      const body = signInRequestSchema.parse({
        email,
        metadata: { adultConfirmed },
        callbackURL: '/?lang=' + locale,
      });
      await read(
        await fetcher('/api/auth/sign-in/magic-link', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
    },
    async signOut() {
      await read(
        await fetcher('/api/auth/sign-out', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        }),
      );
    },
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
