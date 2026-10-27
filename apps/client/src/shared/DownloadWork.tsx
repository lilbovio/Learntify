import { useState } from 'react';
import type { Locale } from '@learntify/api-contracts';

export function DownloadWork({
  content,
  filename,
  locale,
  disabled = false,
}: {
  content: string;
  filename: string;
  locale: Locale;
  disabled?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="download-work">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setFailed(false);
          let url: string | undefined;
          try {
            url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
            link.click();
            const downloadUrl = url;
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          } catch {
            if (url) URL.revokeObjectURL(url);
            setFailed(true);
          }
        }}
      >
        {locale === 'es' ? 'Descargar una copia' : 'Download a copy'}
      </button>
      <small>
        {locale === 'es'
          ? 'Guarda el texto actual en tu dispositivo, incluso sin conexión.'
          : 'Save the current text to your device, even while offline.'}
      </small>
      {failed && (
        <p role="alert">
          {locale === 'es'
            ? 'No se pudo descargar. Copia el texto antes de salir.'
            : 'Download failed. Copy your text before leaving.'}
        </p>
      )}
    </div>
  );
}
