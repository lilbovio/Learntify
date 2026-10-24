import { expect, it } from 'vitest';
import { ApiError } from '@learntify/api-client';
import { socialFailure } from './social-errors';

it('distinguishes recent-login requirements from expired sessions and provider/network failures', () => {
  expect(socialFailure(new ApiError('REAUTHENTICATION_REQUIRED', 409))).toBe('reauth');
  expect(socialFailure(new ApiError('UNAUTHENTICATED', 401))).toBe('session');
  expect(socialFailure(new ApiError('INTERNAL_ERROR', 500))).toBe('request');
  expect(socialFailure(new TypeError('Failed to fetch'))).toBe('request');
});
