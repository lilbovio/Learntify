import { expect, it, vi } from 'vitest';
import { ApiError } from '@learntify/api-client';
import { connectProvider } from './connect-provider';

const stale = () => new ApiError('REAUTHENTICATION_REQUIRED', 409);
it('continues immediately for a recent session', async () => {
  const verify = vi.fn();
  expect(
    await connectProvider({
      start: async () => 'provider',
      currentAccount: async () => ({ id: 'a' }),
      verify,
      onVerify: vi.fn(),
    }),
  ).toBe('provider');
  expect(verify).not.toHaveBeenCalled();
});
it('verifies in place then retries the pending connection exactly once', async () => {
  const start = vi.fn().mockRejectedValueOnce(stale()).mockResolvedValueOnce('provider');
  const verify = vi.fn().mockResolvedValue({});
  expect(
    await connectProvider({
      start,
      currentAccount: async () => ({ id: 'a' }),
      verify,
      onVerify: vi.fn(),
    }),
  ).toBe('provider');
  expect(start).toHaveBeenCalledTimes(2);
  expect(verify).toHaveBeenCalledOnce();
});
it('does not connect after cancellation or a switch to another account', async () => {
  for (const switched of [false, true]) {
    const start = vi.fn().mockRejectedValue(stale());
    const currentAccount = vi
      .fn()
      .mockResolvedValueOnce({ id: 'a' })
      .mockResolvedValueOnce({ id: 'b' });
    await expect(
      connectProvider({
        start,
        currentAccount,
        verify: async () => (switched ? {} : { error: true }),
        onVerify: vi.fn(),
      }),
    ).rejects.toThrow(switched ? 'ACCOUNT_CHANGED' : 'REAUTHENTICATION_REQUIRED');
    expect(start).toHaveBeenCalledOnce();
  }
});
it('offers reauthentication recovery when the browser rejects the device prompt', async () => {
  const start = vi.fn().mockRejectedValue(stale());
  await expect(
    connectProvider({
      start,
      currentAccount: async () => ({ id: 'a' }),
      verify: async () => {
        throw new DOMException('Cancelled', 'NotAllowedError');
      },
      onVerify: vi.fn(),
    }),
  ).rejects.toThrow('REAUTHENTICATION_REQUIRED');
  expect(start).toHaveBeenCalledOnce();
});
