import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const groups = ['apps', 'services', 'modules', 'packages', 'adapters'];
const allowed = {
  contracts: new Set(['contracts']),
  browser: new Set(['contracts', 'browser']),
  domain: new Set([]),
  adapter: new Set(['domain']),
  service: new Set(['contracts', 'domain', 'adapter']),
};
export function importsOf(source, filename = 'file.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const imports = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      if (node.arguments[0] && ts.isStringLiteral(node.arguments[0]))
        imports.push(node.arguments[0].text);
      else imports.push('<computed-import>');
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return imports;
}
export function edgeError(from, target, specifier, declared) {
  if (specifier === '<computed-import>')
    return 'Computed imports require explicit architecture review';
  if (from.layer === 'browser' && specifier.startsWith('node:'))
    return 'Browser cannot import Node built-ins';
  if (!target && specifier.startsWith('@learntify/')) return 'Unknown workspace package';
  if (target && from.name !== target.name) {
    if (!declared.has(target.name)) return 'Undeclared workspace dependency';
    if (specifier !== target.name) return 'Cross-package deep or relative import';
    if (!allowed[from.layer]?.has(target.layer)) return 'Forbidden layer dependency';
  }
  if (from.layer === 'domain' && !specifier.startsWith('.'))
    return 'Domain must remain provider/framework independent';
  return null;
}
async function walk(folder) {
  const result = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.wrangler'].includes(entry.name)) continue;
    const filename = path.join(folder, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(filename)));
    else if (/\.(ts|tsx|mjs)$/.test(entry.name) && !/\.test\./.test(entry.name))
      result.push(filename);
  }
  return result;
}
export async function check(root) {
  const packages = [];
  for (const group of groups) {
    for (const entry of await readdir(path.join(root, group), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const folder = path.join(root, group, entry.name);
      const manifest = JSON.parse(await readFile(path.join(folder, 'package.json'), 'utf8'));
      packages.push({
        name: manifest.name,
        layer: manifest.learntify.layer,
        folder,
        dependencies: new Set(Object.keys(manifest.dependencies ?? {})),
      });
    }
  }
  const errors = [];
  const graph = new Map(packages.map((p) => [p.name, new Set()]));
  for (const from of packages)
    for (const filename of await walk(path.join(from.folder, 'src'))) {
      for (const specifier of importsOf(await readFile(filename, 'utf8'), filename)) {
        const resolved = specifier.startsWith('.')
          ? path.resolve(path.dirname(filename), specifier)
          : null;
        const target = packages.find(
          (p) =>
            specifier === p.name ||
            specifier.startsWith(p.name + '/') ||
            (resolved && (resolved === p.folder || resolved.startsWith(p.folder + path.sep))),
        );
        if (resolved && !target)
          errors.push(
            path.relative(root, filename) +
              ': Relative import escapes its package (' +
              specifier +
              ')',
          );
        const error = edgeError(from, target, specifier, from.dependencies);
        if (error)
          errors.push(path.relative(root, filename) + ': ' + error + ' (' + specifier + ')');
        if (target && target.name !== from.name) graph.get(from.name).add(target.name);
      }
    }
  const visiting = new Set(),
    visited = new Set();
  function visit(name) {
    if (visiting.has(name)) {
      errors.push('Dependency cycle at ' + name);
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const dependency of graph.get(name)) visit(dependency);
    visiting.delete(name);
    visited.add(name);
  }
  for (const name of graph.keys()) visit(name);
  return errors;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = await check(process.cwd());
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Module boundaries passed.');
}
