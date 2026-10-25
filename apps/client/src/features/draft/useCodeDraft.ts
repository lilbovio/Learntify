import { useEffect, useRef, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Lesson } from '@learntify/api-contracts';
import { DraftSync, type DraftState } from './sync';

const api = createApiClient();
export function useCodeDraft(
  lesson: Lesson,
  accountId: string | null,
  onDirty: (dirty: boolean) => void,
) {
  const key = `learntify:code:${lesson.id}:${lesson.version}`;
  const [guestCode, setGuestCode] = useState(() => {
    try {
      return localStorage.getItem(key)?.slice(0, 16000) ?? lesson.example;
    } catch {
      return lesson.example;
    }
  });
  const [localSaved, setLocalSaved] = useState<boolean>();
  const [cloud, setCloud] = useState<{ owner: string; state: DraftState }>();
  const controller = useRef<DraftSync | undefined>(undefined);
  useEffect(() => {
    if (!accountId) {
      onDirty(false);
      return;
    }
    const sync = new DraftSync(
      { ...api, openDraft: (id, version) => api.openDraft(id, version, 'code', accountId) },
      lesson.id,
      lesson.version,
      (state) => {
        setCloud({ owner: accountId, state });
        onDirty(state.dirty);
      },
    );
    controller.current = sync;
    void sync.start();
    const focus = () => {
      void sync.refresh();
    };
    const leave = (event: BeforeUnloadEvent) => {
      if (sync.state.dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('focus', focus);
    window.addEventListener('beforeunload', leave);
    return () => {
      sync.dispose();
      controller.current = undefined;
      onDirty(false);
      window.removeEventListener('focus', focus);
      window.removeEventListener('beforeunload', leave);
    };
  }, [accountId, lesson.id, lesson.version, onDirty]);
  const state = cloud?.owner === accountId ? cloud.state : undefined;
  function edit(content: string) {
    if (accountId) {
      controller.current?.edit(content);
      return;
    }
    setGuestCode(content);
    try {
      localStorage.setItem(key, content);
      setLocalSaved(true);
    } catch {
      setLocalSaved(false);
    }
  }
  return {
    code: accountId ? (state?.content ?? '') : guestCode,
    ready: !accountId || Boolean(state?.opened && state.status !== 'loading'),
    state: accountId ? state : undefined,
    localSaved,
    edit,
    retry: () => {
      void controller.current?.retry();
    },
    resolve: (choice: 'local' | 'remote') => controller.current?.resolve(choice),
  };
}
