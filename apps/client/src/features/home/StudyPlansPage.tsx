import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, createStudyPlanClient, type PlanActivity } from '@learntify/api-client';
import type { Locale, StudyPlan } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { AccountPanel } from '../account/AccountPanel';

export function StudyPlansPage({ locale }: { locale: Locale }) {
  const [account, setAccount] = useState<string | null>(null);
  return (
    <PageFrame locale={locale} title={locale === 'en' ? 'Study plans' : 'Planes de estudio'}>
      <p>
        {locale === 'en'
          ? 'Make room for learning. Set a weekly goal and keep your plans in one place.'
          : 'Haz espacio para aprender. Define una meta semanal y organiza tus planes.'}
      </p>
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} />
      {account ? (
        <PlanWorkspace key={account} locale={locale} />
      ) : (
        <p>
          {locale === 'en'
            ? 'Sign in to manage your private study plans.'
            : 'Inicia sesión para gestionar tus planes privados.'}
        </p>
      )}
    </PageFrame>
  );
}
function PlanWorkspace({ locale }: { locale: Locale }) {
  const es = locale === 'es';
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selected, setSelected] = useState<StudyPlan | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState(120);
  const [status, setStatus] = useState<StudyPlan['status']>('draft');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [slugConflict, setSlugConflict] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error && !busy) {
      errorRef.current?.focus();
      errorRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [error, busy]);
  const [activity, setActivity] = useState<PlanActivity[]>([]);
  const api = useMemo(
    () => createStudyPlanClient((item) => setActivity((items) => [item, ...items].slice(0, 12))),
    [],
  );
  function report(cause: unknown) {
    setSlugConflict(cause instanceof ApiError && cause.status === 409);
    setError(
      cause instanceof ApiError && cause.status === 409
        ? es
          ? 'Este identificador ya existe. Elige otro.'
          : 'This slug already exists. Choose another.'
        : cause instanceof ApiError && cause.status === 401
          ? es
            ? 'Tu sesión terminó. Inicia sesión de nuevo.'
            : 'Your session expired. Sign in again.'
          : es
            ? 'No se pudo completar la solicitud. Inténtalo de nuevo.'
            : 'The request could not be completed. Try again.',
    );
  }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void api
      .list(page, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setPlans(items);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) report(cause);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api, page, refresh]);
  function fill(plan: StudyPlan | null) {
    setError('');
    setSlugConflict(false);
    setSelected(plan);
    setTitle(plan?.title ?? '');
    setSlug(plan?.slug ?? '');
    setDescription(plan?.description ?? '');
    setMinutes(plan?.weeklyMinutes ?? 120);
    setStatus(plan?.status ?? 'draft');
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setSlugConflict(false);
    setMessage('');
    try {
      await action();
    } catch (cause) {
      report(cause);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="study-plans">
      <p role="status">{message}</p>
      <section className="clay-card" aria-label={es ? 'Tus planes' : 'Your plans'}>
        <h2>{es ? 'Tus planes' : 'Your plans'}</h2>
        <div className="plan-actions">
          <button disabled={busy || loading} onClick={() => setRefresh((value) => value + 1)}>
            {es ? 'Actualizar lista' : 'Refresh list'}
          </button>
          <button disabled={busy} onClick={() => fill(null)}>
            {es ? 'Nuevo plan' : 'New plan'}
          </button>
        </div>
        {loading ? (
          <p>{es ? 'Cargando…' : 'Loading…'}</p>
        ) : plans.length === 0 ? (
          <p>{es ? 'No hay planes en esta página.' : 'No plans on this page yet.'}</p>
        ) : (
          <ul className="plan-list">
            {plans.map((plan) => (
              <li key={plan.id}>
                <button
                  disabled={busy}
                  onClick={() => void run(async () => fill(await api.get(plan.id)))}
                >
                  {plan.title}
                </button>
                <span>
                  {plan.weeklyMinutes} min / {es ? 'semana' : 'week'} ·{' '}
                  {es
                    ? { draft: 'Borrador', active: 'Activo', completed: 'Completado' }[plan.status]
                    : { draft: 'Draft', active: 'Active', completed: 'Completed' }[plan.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="plan-actions">
          <button
            disabled={busy || loading || page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            {es ? 'Anterior' : 'Previous'}
          </button>
          <span>
            {es ? 'Página' : 'Page'} {page}
          </span>
          <button
            disabled={busy || loading || plans.length < 20}
            onClick={() => setPage((value) => value + 1)}
          >
            {es ? 'Siguiente' : 'Next'}
          </button>
        </div>
      </section>
      <section className="clay-card">
        <h2>
          {selected ? (es ? 'Editar plan' : 'Edit plan') : es ? 'Crear un plan' : 'Create a plan'}
        </h2>
        {error && (
          <p id="plan-error" className="plan-error" role="alert" tabIndex={-1} ref={errorRef}>
            {error}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const input = { title, description, weeklyMinutes: minutes };
              const plan = selected
                ? await api.replace(selected.id, { ...input, status })
                : await api.create({ ...input, slug });
              fill(plan);
              setRefresh((value) => value + 1);
              setMessage(es ? 'Plan guardado.' : 'Plan saved.');
            });
          }}
        >
          <fieldset disabled={busy} className="plan-fields">
            <label>
              {es ? 'Título' : 'Title'}
              <input
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              {es ? 'Identificador' : 'Slug'}
              <input
                required
                minLength={3}
                maxLength={60}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                readOnly={Boolean(selected)}
                aria-invalid={slugConflict || undefined}
                aria-describedby={slugConflict ? 'plan-error' : undefined}
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  if (slugConflict) {
                    setSlugConflict(false);
                    setError('');
                  }
                }}
              />
            </label>
            <small>
              {es
                ? 'Usa letras minúsculas, números y guiones. No se cambia después de crear el plan.'
                : 'Use lowercase letters, numbers and hyphens. The slug stays fixed after creation.'}
            </small>
            <div>
              <label htmlFor="plan-description">{es ? 'Descripción' : 'Description'}</label>
              <textarea
                id="plan-description"
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <label>
              {es ? 'Minutos por semana' : 'Minutes per week'}
              <input
                type="number"
                required
                min={15}
                max={1200}
                step={1}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
              />
            </label>
            {selected && (
              <div>
                <label htmlFor="plan-status">{es ? 'Estado' : 'Status'}</label>
                <select
                  id="plan-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StudyPlan['status'])}
                >
                  <option value="draft">{es ? 'Borrador' : 'Draft'}</option>
                  <option value="active">{es ? 'Activo' : 'Active'}</option>
                  <option value="completed">{es ? 'Completado' : 'Completed'}</option>
                </select>
              </div>
            )}
            <button type="submit">
              {selected
                ? es
                  ? 'Guardar cambios'
                  : 'Save changes'
                : es
                  ? 'Crear plan'
                  : 'Create plan'}
            </button>
          </fieldset>
        </form>
        {selected && (
          <button
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  es
                    ? '¿Eliminar este plan? Esta acción no se puede deshacer.'
                    : 'Delete this plan? This cannot be undone.',
                )
              )
                void run(async () => {
                  await api.delete(selected.id);
                  fill(null);
                  setRefresh((value) => value + 1);
                  setMessage(es ? 'Plan eliminado.' : 'Plan deleted.');
                });
            }}
          >
            {es ? 'Eliminar plan' : 'Delete plan'}
          </button>
        )}
      </section>
      <details className="clay-card">
        <summary>{es ? 'Actividad de la API (demostración)' : 'API activity (demo)'}</summary>
        <p>
          {es
            ? 'Solicitudes reales de esta pantalla. No incluye cookies ni credenciales.'
            : 'Actual requests from this screen. Cookies and credentials are excluded.'}
        </p>
        {activity.map((item, index) => (
          <details key={index}>
            <summary>
              {item.method} {item.path} → {item.status}
            </summary>
            <pre>{JSON.stringify({ request: item.request, response: item.response }, null, 2)}</pre>
          </details>
        ))}
      </details>
    </div>
  );
}
