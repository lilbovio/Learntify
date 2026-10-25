import { ApiError } from '@learntify/api-client';

/** Retry once after verification; never silently link a different account. */
export async function connectProvider(actions: {
  start: () => Promise<string>;
  currentAccount: () => Promise<{ id: string } | null>;
  verify: () => Promise<{ error?: unknown }>;
  onVerify: () => void;
}) {
  try {
    return await actions.start();
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'REAUTHENTICATION_REQUIRED') throw error;
  }
  const original = await actions.currentAccount();
  if (!original) throw new ApiError('UNAUTHENTICATED', 401);
  actions.onVerify();
  const verified = await actions.verify().catch(() => ({ error: true }));
  if (verified.error) throw new ApiError('REAUTHENTICATION_REQUIRED', 409);
  if ((await actions.currentAccount())?.id !== original.id)
    throw new ApiError('ACCOUNT_CHANGED', 409);
  return actions.start();
}
