import path from 'node:path';
import { fileURLToPath } from 'node:url';

function data(body: unknown): Record<string, unknown> {
  if (
    !body ||
    typeof body !== 'object' ||
    !('data' in body) ||
    !body.data ||
    typeof body.data !== 'object'
  )
    return {};
  return body.data as Record<string, unknown>;
}

/** Read-only smoke probe. Never sends credentials, follows redirects, or prints response bodies. */
export async function checkPreview(origin: string, accounts: boolean, request = fetch) {
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    (url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
  )
    throw new Error('Use an HTTPS origin or a local HTTP origin without a path.');
  const checks = [
    {
      name: 'API health',
      path: '/api/v1/health',
      valid: (body: unknown) => data(body).status === 'ok',
    },
    {
      name: 'Account mode',
      path: '/api/v1/capabilities',
      valid: (body: unknown) => data(body).accounts === accounts && data(body).community === false,
    },
    ...(['en', 'es'] as const).map((locale) => ({
      name: `${locale} lesson catalog`,
      path: `/api/v1/lessons?locale=${locale}`,
      valid: (body: unknown) => {
        const catalog = data(body);
        return (
          Array.isArray(catalog) &&
          catalog.length > 0 &&
          catalog.every(
            (entry: unknown) =>
              entry !== null &&
              typeof entry === 'object' &&
              'id' in entry &&
              typeof entry.id === 'string' &&
              'title' in entry &&
              typeof entry.title === 'string' &&
              'version' in entry &&
              typeof entry.version === 'number' &&
              Number.isInteger(entry.version),
          )
        );
      },
    })),
  ];
  const results: { name: string; passed: boolean }[] = [];
  for (const check of checks) {
    let passed = false;
    try {
      const response = await request(origin + check.path, {
        redirect: 'error',
        credentials: 'omit',
        signal: AbortSignal.timeout(5000),
      });
      passed =
        response.status === 200 &&
        (response.headers.get('content-type') ?? '').includes('application/json') &&
        check.valid(await response.json());
    } catch {
      /* Report only the check name; errors can contain sensitive URL or response data. */
    }
    results.push({ name: check.name, passed });
  }
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4 || !['public', 'accounts'].includes(process.argv[3]!))
      throw new Error('Invalid arguments');
    const results = await checkPreview(process.argv[2]!, process.argv[3] === 'accounts');
    for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
    if (results.some((result) => !result.passed)) process.exitCode = 1;
  } catch {
    console.error(
      'Usage: pnpm check:preview <origin> <public|accounts>. No credentials are needed.',
    );
    process.exitCode = 1;
  }
}
