/**
 * Static manifest / locale / icon / artifact checks for the bundle.
 * Mirrors what a reviewer would check before installing the package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lines = [];
let failed = false;

function pass(message) {
  lines.push('PASS ' + message);
}
function fail(message) {
  failed = true;
  lines.push('FAIL ' + message);
}
function check(condition, message) {
  if (condition) pass(message);
  else fail(message);
}
function readJson(relative) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  } catch (error) {
    fail(`invalid JSON ${relative}: ${error.message}`);
    return undefined;
  }
}

/* manifest */
const pkg = readJson('package.json');
if (pkg) {
  check(typeof pkg.name === 'string' && pkg.name.length > 0, 'manifest: package name');
  check(typeof pkg.version === 'string' && /^\d+\.\d+\.\d+/.test(pkg.version), 'manifest: semver version');
  check(pkg.type === 'module', 'manifest: ESM package');
  check(pkg.exports && pkg.exports['.'] === './index.js', 'manifest: exports host entry');
  check(pkg.exports && pkg.exports['./client'] === './client.js', 'manifest: exports client entry');
  check(pkg.exports && pkg.exports['./locale/*.json'] === './locale/*.json', 'manifest: exports locale resources');
  check(pkg.exports && pkg.exports['./icon'] === './icon.svg', 'manifest: exports icon');
  check(pkg.dsh && pkg.dsh.bundle && pkg.dsh.bundle.patch === './cordis.patch.yml', 'manifest: bundle patch declared');
  check(pkg.dsh && pkg.dsh.client && pkg.dsh.client.platform === 'web', 'manifest: web client platform');
  check(pkg.dsh && pkg.dsh.client && pkg.dsh.client.immediately === true, 'manifest: client loads immediately');
  check(Array.isArray(pkg.files) && pkg.files.includes('client.js') && pkg.files.includes('index.js'), 'manifest: files list ships runtime entries');
  check(pkg.license === 'MIT' || typeof pkg.license === 'string', 'manifest: license declared');
  check(Array.isArray(pkg.dependencies) === false && pkg.dependencies && pkg.dependencies['@deepseek-ai/schemastery'], 'manifest: schemastery dependency declared');
}

/* bundle patch */
try {
  const patch = fs.readFileSync(path.join(root, 'cordis.patch.yml'), 'utf8');
  check(patch.includes('- insert:'), 'patch: insert list');
  check(pkg && patch.includes(`'${pkg.name}'`), 'patch: names the package');
  check(/id:\s*dsh-theme/.test(patch), 'patch: row id dsh-theme');
} catch (error) {
  fail('patch: ' + error.message);
}

/* locales */
for (const locale of ['en', 'zh']) {
  const data = readJson(`locale/${locale}.json`);
  check(Boolean(data && data.meta && data.meta.title && data.meta.description), `locale ${locale}: meta title and description`);
}

/* icon */
try {
  const icon = fs.readFileSync(path.join(root, 'icon.svg'));
  const text = icon.toString('utf8');
  check(icon.length > 0 && icon.length <= 256 * 1024, 'icon: present and under the size limit');
  check(text.trimStart().startsWith('<svg') && text.includes('viewBox'), 'icon: valid SVG with viewBox');
  check(text.includes('aria-label') || text.includes('role="img"'), 'icon: accessible label');
} catch (error) {
  fail('icon: ' + error.message);
}

/* generated client artifact */
try {
  const client = fs.readFileSync(path.join(root, 'client.js'), 'utf8');
  check(client.includes('window.__ModuleLoader__.load('), 'client: module loader wrapper');
  check(client.includes(`id: '${pkg ? pkg.name : '@local/dsh-personalization'}'`), 'client: module id matches the package');
  check(!client.includes('__PALETTES__'), 'client: palette placeholder replaced');
  check((client.match(/"bgBase":/g) || []).length === 18, 'client: nine palettes with light and dark anchors');
  check(client.includes('--dsw-alias-bg-base'), 'client: theme token layer present');
  check(client.includes('requested') === false, 'client: no placeholder markers');
} catch (error) {
  fail('client: ' + error.message);
}

/* host half */
try {
  const host = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
  check(host.includes("from '@deepseek-ai/schemastery'"), 'host: schemastery import');
  check(host.includes('.volatile()'), 'host: volatile settings field');
  check(host.includes('preferences'), 'host: preferences field');
  check(host.includes('export const Config'), 'host: Config export');
} catch (error) {
  fail('host: ' + error.message);
}

console.log(lines.join('\n'));
console.log('\n' + (failed ? 'RESULT: FAILED' : 'RESULT: all manifest checks passed'));
if (failed) process.exitCode = 1;
