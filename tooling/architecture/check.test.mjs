import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edgeError, importsOf } from './check.mjs';
const browser = { name: '@learntify/client', layer: 'browser' };
const domain = { name: '@learntify/learning', layer: 'domain' };
test('rejects browser imports of domain implementations even when declared', () => {
  assert.equal(
    edgeError(browser, domain, domain.name, new Set([domain.name])),
    'Forbidden layer dependency',
  );
});
test('rejects deep and relative package access', () => {
  assert.equal(
    edgeError(browser, domain, '../../modules/learning/src/index', new Set([domain.name])),
    'Cross-package deep or relative import',
  );
});
test('rejects provider imports inside a domain', () => {
  assert.equal(
    edgeError(domain, undefined, 'hono', new Set()),
    'Domain must remain provider/framework independent',
  );
});
test('rejects Node built-ins and unresolved workspace aliases in the browser', () => {
  assert.equal(
    edgeError(browser, undefined, 'node:fs', new Set()),
    'Browser cannot import Node built-ins',
  );
  assert.equal(
    edgeError(browser, undefined, '@learntify/missing', new Set()),
    'Unknown workspace package',
  );
});
test('finds static imports, exports and dynamic imports through the TypeScript parser', () => {
  assert.deepEqual(importsOf("import type { A } from 'a'; export { b } from 'b'; import('c');"), [
    'a',
    'b',
    'c',
  ]);
  assert.deepEqual(importsOf('import(variable)'), ['<computed-import>']);
});
