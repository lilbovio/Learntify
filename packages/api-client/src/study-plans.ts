import { studyPlanListResponseSchema, studyPlanResponseSchema } from '@learntify/api-contracts';
import { ApiError } from './index';
export type PlanActivity = {
  method: string;
  path: string;
  status: number;
  request: unknown;
  response: unknown;
};
export function createStudyPlanClient(
  onActivity: (activity: PlanActivity) => void,
  fetcher: typeof fetch = fetch,
) {
  async function request(method: string, suffix = '', input?: unknown, signal?: AbortSignal) {
    const path = '/api/v1/study-plans' + suffix;
    const response = await fetcher(path, {
      method,
      credentials: 'same-origin',
      ...(signal ? { signal } : {}),
      ...(input === undefined
        ? {}
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
    });
    const body: unknown = response.status === 204 ? null : await response.json();
    if (!signal?.aborted)
      onActivity({ method, path, status: response.status, request: input ?? null, response: body });
    if (!response.ok)
      throw new ApiError(
        response.status === 409 ? 'SLUG_CONFLICT' : 'PLAN_REQUEST_FAILED',
        response.status,
      );
    return body;
  }
  return {
    async list(page = 1, signal?: AbortSignal) {
      return studyPlanListResponseSchema.parse(
        await request('GET', '?page=' + page + '&limit=20', undefined, signal),
      ).data;
    },
    async get(id: string) {
      return studyPlanResponseSchema.parse(await request('GET', '/' + encodeURIComponent(id))).data;
    },
    async create(input: unknown) {
      return studyPlanResponseSchema.parse(await request('POST', '', input)).data;
    },
    async replace(id: string, input: unknown) {
      return studyPlanResponseSchema.parse(
        await request('PUT', '/' + encodeURIComponent(id), input),
      ).data;
    },
    async delete(id: string) {
      await request('DELETE', '/' + encodeURIComponent(id));
    },
  };
}
