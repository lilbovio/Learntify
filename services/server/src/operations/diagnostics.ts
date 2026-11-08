export interface FailureEvent {
  event: 'request_failed';
  requestId: string;
  area: 'auth' | 'drafts' | 'preferences' | 'practice' | 'study-plans' | 'lessons' | 'other';
  status: number;
}

/** Fixed categories only: never include request paths, query strings or exception contents. */
export function failureArea(path: string): FailureEvent['area'] {
  if (path === '/api/auth' || path.startsWith('/api/auth/')) return 'auth';
  for (const area of ['drafts', 'preferences', 'practice', 'study-plans', 'lessons'] as const)
    if (path === `/api/v1/${area}` || path.startsWith(`/api/v1/${area}/`)) return area;
  return 'other';
}

export function reportFailure(event: FailureEvent): void {
  console.error(JSON.stringify(event));
}
