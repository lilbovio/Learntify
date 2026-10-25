import {
  apiErrorSchema,
  socialRequestSchema,
  socialProvidersResponseSchema,
  socialRedirectSchema,
  revokeSessionsResponseSchema,
  deleteAccountSchema,
  deleteAccountResponseSchema,
  accountResponseSchema,
  capabilitiesResponseSchema,
  signInRequestSchema,
  draftResponseSchema,
  savedDraftResponseSchema,
  preferencesResponseSchema,
  preferencesSchema,
  type LearningPreferences,
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
    async socialProviders() {
      return socialProvidersResponseSchema.parse(
        await read(await fetcher('/api/auth/social-providers')),
      ).providers;
    },
    async socialConnections() {
      return socialProvidersResponseSchema.parse(
        await read(await fetcher('/api/auth/social-connections')),
      ).providers;
    },
    async startSocial(action: 'sign-in' | 'link', provider: 'google' | 'github', locale: Locale) {
      const result = socialRedirectSchema.parse(
        await read(
          await fetcher('/api/auth/social/' + action, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(socialRequestSchema.parse({ provider, locale })),
          }),
        ),
      );
      const url = new URL(result.url);
      const expected = provider === 'google' ? 'accounts.google.com' : 'github.com';
      if (url.protocol !== 'https:' || url.hostname !== expected || url.username || url.password)
        throw new ApiError('INVALID_RESPONSE', 502);
      return result.url;
    },
    async revokeOtherSessions() {
      return revokeSessionsResponseSchema.parse(
        await read(
          await fetcher('/api/auth/revoke-other-sessions', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
          }),
        ),
      );
    },
    async deleteAccount(confirmation: string) {
      return deleteAccountResponseSchema.parse(
        await read(
          await fetcher('/api/auth/delete-user', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deleteAccountSchema.parse({ confirmation })),
          }),
        ),
      );
    },
    async getPreferences(signal?: AbortSignal) {
      return preferencesResponseSchema.parse(
        await read(await fetcher('/api/v1/preferences', signal ? { signal } : {})),
      ).data;
    },
    async savePreferences(input: LearningPreferences) {
      return preferencesResponseSchema.parse(
        await read(
          await fetcher('/api/v1/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferencesSchema.parse(input)),
          }),
        ),
      ).data;
    },
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
    async requestSignIn(
      email: string,
      adultConfirmed: boolean,
      locale: Locale,
      dedicated = false,
      reauthenticate = false,
    ) {
      const body = signInRequestSchema.parse({
        email,
        metadata: { adultConfirmed },
        callbackURL: reauthenticate
          ? '/' + locale + '/settings'
          : dedicated
            ? '/' + locale + '/today'
            : '/?lang=' + locale,
        ...(dedicated
          ? {
              newUserCallbackURL: '/' + locale + '/start',
              errorCallbackURL: '/' + locale + '/auth',
            }
          : {}),
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
