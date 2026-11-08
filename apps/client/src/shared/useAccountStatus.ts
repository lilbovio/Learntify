import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import { sessionEvent } from './session-events';

const api = createApiClient();

export type AccountStatus = 'loading' | 'disabled' | 'signedOut' | 'signedIn' | 'failed';

export function useAccountStatus() {
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void (async () => {
      try {
        const capabilities = await api.capabilities(controller.signal);
        if (!capabilities.accounts) {
          if (active && !controller.signal.aborted) setStatus('disabled');
          return;
        }
        const account = await api.currentAccount(controller.signal);
        if (active && !controller.signal.aborted) setStatus(account ? 'signedIn' : 'signedOut');
      } catch {
        if (active && !controller.signal.aborted) setStatus('failed');
      }
    })();
    const refresh = () => setReload((value) => value + 1);
    window.addEventListener(sessionEvent, refresh);
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener(sessionEvent, refresh);
    };
  }, [reload]);
  return { status, refresh: () => setReload((value) => value + 1) };
}
