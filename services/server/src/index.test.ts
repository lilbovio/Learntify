import { describe, expect, it } from 'vitest';
import { app } from './index';
import { lessonResponseSchema } from '@learntify/api-contracts';

describe('public lesson API', () => {
  it('lists localized lesson names and serves the second lesson', async () => {
    const catalog = await app.request('/api/v1/lessons?locale=es');
    expect((await catalog.json()).data).toContainEqual({
      id: 'storing-values',
      version: 1,
      title: 'Guardar valores con variables',
    });
    const response = await app.request('/api/v1/lessons/storing-values/predictions', {
      method: 'POST',
      body: JSON.stringify({ locale: 'en', lessonVersion: 1, choiceId: 'ten' }),
    });
    expect((await response.json()).data.correct).toBe(true);
    expect((await app.request('/api/v1/lessons?locale=fr')).status).toBe(400);
  });
  it('rejects excessive input before evaluating it', async () => {
    const response = await app.request('/api/v1/lessons/values-and-expressions/predictions', {
      method: 'POST',
      body: 'x'.repeat(3000),
    });
    expect(response.status).toBe(413);
  });
  it('serves validated English and Spanish content', async () => {
    for (const locale of ['en', 'es']) {
      const response = await app.request('/api/v1/lessons/values-and-expressions?locale=' + locale);
      expect(response.status).toBe(200);
      expect(lessonResponseSchema.parse(await response.json()).data.locale).toBe(locale);
      expect(response.headers.get('X-Request-Id')).toBeTruthy();
    }
  });
  it('does not silently substitute an unsupported locale', async () => {
    expect((await app.request('/api/v1/lessons/values-and-expressions?locale=fr')).status).toBe(
      400,
    );
  });
  it('rejects malformed JSON, unknown fields, and stale content', async () => {
    const send = (body: string) =>
      app.request('/api/v1/lessons/values-and-expressions/predictions', { method: 'POST', body });
    expect((await send('{')).status).toBe(400);
    expect(
      (
        await send(
          JSON.stringify({ locale: 'en', lessonVersion: 1, choiceId: 'five', mastered: true }),
        )
      ).status,
    ).toBe(422);
    expect(
      (await send(JSON.stringify({ locale: 'en', lessonVersion: 2, choiceId: 'five' }))).status,
    ).toBe(409);
  });
  it('exposes no unauthenticated draft write route', async () => {
    expect((await app.request('/api/v1/drafts', { method: 'POST', body: '{}' })).status).toBe(404);
  });
  it('reports unreleased features truthfully', async () => {
    const response = await app.request('/api/v1/capabilities');
    expect((await response.json()).data).toMatchObject({
      accounts: false,
      cloudDrafts: false,
      codeExecution: true,
      community: false,
    });
  });
});
