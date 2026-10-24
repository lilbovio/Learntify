import { useEffect, useState } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { passkeyAuth, supportsPasskeys } from './passkeys';

const copy = {
  en: {
    title: 'Passkeys',
    help: 'Add a passkey to sign back in with your device’s fingerprint, face unlock, or PIN. Keep email access for recovery. Manage passkeys within 15 minutes of signing in.',
    add: 'Add a passkey',
    remove: 'Remove',
    name: 'Passkey name',
    fallback: 'Passkey',
    error:
      'Could not complete the passkey request. If your sign-in was more than 15 minutes ago, sign in again. You can still use email.',
    unsupported:
      'Passkeys are unavailable in this browser. Use a supported browser with HTTPS or localhost.',
    loading: 'Loading passkeys…',
    empty: 'No passkeys added yet.',
    saved: 'Passkey added.',
    removed: 'Passkey removed.',
  },
  es: {
    title: 'Claves de acceso',
    help: 'Añade una clave de acceso para volver a entrar con tu huella, reconocimiento facial o PIN. Conserva acceso al correo para recuperar tu cuenta. Administra las claves durante los primeros 15 minutos de sesión.',
    add: 'Añadir clave de acceso',
    remove: 'Quitar',
    name: 'Nombre de la clave',
    fallback: 'Clave de acceso',
    error:
      'No se pudo completar la solicitud. Si iniciaste sesión hace más de 15 minutos, vuelve a iniciarla. Puedes seguir usando el correo.',
    unsupported:
      'Este navegador no admite claves de acceso. Usa un navegador compatible con HTTPS o localhost.',
    loading: 'Cargando claves…',
    empty: 'Todavía no hay claves de acceso.',
    saved: 'Clave de acceso añadida.',
    removed: 'Clave de acceso eliminada.',
  },
};
export function PasskeySettings({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [keys, setKeys] = useState<{ id: string; name?: string | null | undefined }[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState('');
  const refresh = async () => {
    const result = await passkeyAuth.passkey.listUserPasskeys();
    if (result.error) throw new Error('Passkeys unavailable');
    setKeys(result.data ?? []);
  };
  useEffect(() => {
    void refresh()
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  }, []);
  async function act(action: () => Promise<{ error?: unknown }>, message: string) {
    setBusy(true);
    setError(false);
    setNotice('');
    try {
      const result = await action();
      if (result.error) throw new Error('Passkey request failed');
      await refresh();
      setNotice(message);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="clay-card" aria-labelledby="passkeys-title">
      <h2 id="passkeys-title">{text.title}</h2>
      <p>{text.help}</p>
      {supportsPasskeys() ? (
        <>
          <label htmlFor="passkey-name">{text.name}</label>
          <input
            id="passkey-name"
            value={name}
            maxLength={80}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            disabled={busy}
            onClick={() =>
              void act(
                () => passkeyAuth.passkey.addPasskey({ name: name.trim() || text.fallback }),
                text.saved,
              )
            }
          >
            {text.add}
          </button>
        </>
      ) : (
        <p>{text.unsupported}</p>
      )}
      {busy && <p role="status">{text.loading}</p>}
      {!busy && !error && keys.length === 0 && <p>{text.empty}</p>}
      <ul>
        {keys.map((key) => (
          <li key={key.id}>
            {key.name || text.fallback}{' '}
            <button
              disabled={busy}
              onClick={() =>
                void act(() => passkeyAuth.passkey.deletePasskey({ id: key.id }), text.removed)
              }
            >
              {text.remove}
            </button>
          </li>
        ))}
      </ul>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{text.error}</p>}
    </section>
  );
}
