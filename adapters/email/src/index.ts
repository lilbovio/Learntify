interface BudgetDatabase {
  prepare(sql: string): {
    bind(...values: (string | number)[]): { first<T>(): Promise<T | null> };
  };
}

export class EmailUnavailable extends Error {
  constructor() {
    super('Email sign-in is temporarily unavailable.');
  }
}

/** Reserve before sending; failures consume a reservation, preventing unsafe retries. */
export async function reserveEmail(db: BudgetDatabase, now = new Date()): Promise<boolean> {
  const day = now.toISOString().slice(0, 10);
  const monthStart = day.slice(0, 7) + '-01';
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);
  const result = await db
    .prepare(
      `
    INSERT INTO email_budget (day, sent)
    SELECT ?, 1 WHERE (SELECT COALESCE(SUM(sent), 0) FROM email_budget WHERE day >= ? AND day < ?) < 2500
    ON CONFLICT(day) DO UPDATE SET sent = sent + 1
    WHERE sent < 90 AND (SELECT COALESCE(SUM(sent), 0) FROM email_budget WHERE day >= ? AND day < ?) < 2500
    RETURNING sent
  `,
    )
    .bind(day, monthStart, nextMonth, monthStart, nextMonth)
    .first<{ sent: number }>();
  return result !== null;
}

export function createResendDelivery(configuration: {
  database: BudgetDatabase;
  apiKey: string;
  from: string;
  origin: string;
  fetch?: typeof fetch;
}) {
  return async ({ email, url }: { email: string; url: string }): Promise<void> => {
    if (new URL(url).origin !== configuration.origin) throw new EmailUnavailable();
    if (!(await reserveEmail(configuration.database))) throw new EmailUnavailable();
    try {
      const response = await (configuration.fetch ?? fetch)('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${configuration.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          from: configuration.from,
          to: [email],
          subject: 'Learntify — Sign in / Iniciar sesión',
          text: `Sign in to Learntify / Inicia sesión en Learntify:\n\n${url}\n\nThis link expires in 10 minutes. / Este enlace vence en 10 minutos.\nIf you did not request it, ignore this email. / Si no lo solicitaste, ignora este correo.`,
        }),
      });
      if (!response.ok) throw new EmailUnavailable();
    } catch {
      // Provider responses can include addresses; do not expose or log them.
      throw new EmailUnavailable();
    }
  };
}
