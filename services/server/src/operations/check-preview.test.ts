import { expect, it, vi } from 'vitest';
import { checkPreview } from '../../scripts/check-preview';
import { createApp } from '../index';

it('checks both catalogs and expected account mode without sending credentials', async () => {
  const app = createApp();
  const request = vi.fn<typeof fetch>(async (input, init) => app.request(String(input), init));
  const result = await checkPreview('https://learntify.test', false, request);
  expect(result).toHaveLength(4);
  expect(result.every((check) => check.passed)).toBe(true);
  for (const [, init] of request.mock.calls) {
    expect(init).toMatchObject({ redirect: 'error', credentials: 'omit' });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  }
  const mismatch = await checkPreview('https://learntify.test', true, request);
  expect(mismatch.find((check) => check.name === 'Account mode')?.passed).toBe(false);
});

it('rejects unsafe origins and fails safely for redirects, HTML and provider failures', async () => {
  const request = vi.fn<typeof fetch>();
  for (const origin of [
    'http://example.com',
    'https://host.test/path',
    'https://user:secret@host.test',
    'https://host.test?secret=value',
  ])
    await expect(checkPreview(origin, false, request)).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
  request
    .mockRejectedValueOnce(new Error('secret-provider-detail'))
    .mockResolvedValueOnce(
      new Response('<html>fallback</html>', { headers: { 'content-type': 'text/html' } }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 302 }))
    .mockResolvedValueOnce(Response.json({ data: [] }));
  const result = await checkPreview('http://localhost:8790', false, request);
  expect(result.every((check) => !check.passed)).toBe(true);
  expect(JSON.stringify(result)).not.toContain('secret');
});
