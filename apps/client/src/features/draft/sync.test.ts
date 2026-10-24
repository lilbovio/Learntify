import { afterEach, expect, it, vi } from 'vitest';
import { ApiError } from '@learntify/api-client';
import { DraftSync, type DraftPort } from './sync';

function fixture() {
  vi.useFakeTimers();
  const port = {
    openDraft: vi
      .fn<DraftPort['openDraft']>()
      .mockResolvedValue({ id: 'draft', content: '', revision: 1 }),
    getDraft: vi
      .fn<DraftPort['getDraft']>()
      .mockResolvedValue({ id: 'draft', content: 'other device', revision: 2 }),
    saveDraft: vi.fn<DraftPort['saveDraft']>(),
  };
  return { port, sync: new DraftSync(port, 'lesson', 1, () => {}) };
}
afterEach(() => vi.useRealTimers());
it('coalesces edits and skips unchanged content', async () => {
  const { port, sync } = fixture();
  port.saveDraft.mockResolvedValue({ revision: 2 });
  await sync.start();
  sync.edit('a');
  sync.edit('ab');
  sync.edit('abc');
  await vi.advanceTimersByTimeAsync(1200);
  expect(port.saveDraft).toHaveBeenCalledTimes(1);
  expect(port.saveDraft.mock.calls[0]![0].content).toBe('abc');
  sync.edit('abc');
  await vi.advanceTimersByTimeAsync(1200);
  expect(port.saveDraft).toHaveBeenCalledTimes(1);
  sync.dispose();
});
it('retries a lost acknowledgement with the same operation before newer edits', async () => {
  const { port, sync } = fixture();
  port.saveDraft
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ revision: 2 })
    .mockResolvedValueOnce({ revision: 3 });
  await sync.start();
  sync.edit('first');
  await vi.advanceTimersByTimeAsync(1200);
  expect(sync.state.status).toBe('error');
  sync.edit('newer');
  await sync.retry();
  expect(port.saveDraft.mock.calls[1]![0]).toEqual(port.saveDraft.mock.calls[0]![0]);
  await vi.advanceTimersByTimeAsync(1200);
  expect(port.saveDraft.mock.calls[2]![0]).toMatchObject({ content: 'newer', expectedRevision: 2 });
  expect(sync.state).toMatchObject({ content: 'newer', status: 'saved', dirty: false });
  sync.dispose();
});
it('requires explicit conflict resolution before replacing another device’s notes', async () => {
  const { port, sync } = fixture();
  port.saveDraft
    .mockRejectedValueOnce(new ApiError('VERSION_CONFLICT', 409))
    .mockResolvedValueOnce({ revision: 3 });
  await sync.start();
  sync.edit('mine');
  await vi.advanceTimersByTimeAsync(1200);
  expect(sync.state).toMatchObject({
    status: 'conflict',
    content: 'mine',
    remote: { content: 'other device' },
  });
  await vi.advanceTimersByTimeAsync(5000);
  expect(port.saveDraft).toHaveBeenCalledTimes(1);
  sync.resolve('local');
  await vi.advanceTimersByTimeAsync(1200);
  expect(port.saveDraft.mock.calls[1]![0]).toMatchObject({ content: 'mine', expectedRevision: 2 });
  sync.dispose();
});
it('does not refresh over unsaved edits and cancels scheduled work on disposal', async () => {
  const { port, sync } = fixture();
  await sync.start();
  sync.edit('unsaved');
  await sync.refresh();
  expect(port.getDraft).not.toHaveBeenCalled();
  sync.dispose();
  await vi.advanceTimersByTimeAsync(1200);
  expect(port.saveDraft).not.toHaveBeenCalled();
});
