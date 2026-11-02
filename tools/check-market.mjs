#!/usr/bin/env node
/**
 * Dependency-free checks for market/index.json (DSH plugin market format 1).
 *
 * The authoritative validator is `@deepseek-ai/dsh-plugin-market-index`; this
 * script keeps CI dependency-free while still catching the mistakes that would
 * break Discover or the pinned install target.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const check = (ok, message) => { if (!ok) problems.push(message); };

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const market = JSON.parse(readFileSync(join(root, 'market/index.json'), 'utf8'));

check(market.format === 1, 'format must be 1');
check(market.title && typeof market.title === 'object' && typeof market.title.en === 'string' && market.title.en.trim() !== '', 'title must be a localized text object with en');
check(Array.isArray(market.plugins) && market.plugins.length > 0, 'plugins must be a non-empty array');

const entry = market.plugins.find((plugin) => plugin.name === pkg.name);
check(entry !== undefined, `plugins must include ${pkg.name}`);
if (entry !== undefined) {
  check(entry.title && typeof entry.title.en === 'string' && entry.title.en.trim() !== '', `${pkg.name}: title.en is required`);
  const latest = Array.isArray(entry.versions) ? entry.versions[0] : undefined;
  check(latest !== undefined, `${pkg.name}: versions must not be empty`);
  if (latest !== undefined) {
    check(latest.version === pkg.version, `${pkg.name}: market version ${latest.version} must match package.json version ${pkg.version}`);
    check(Number.isInteger(latest.publishTimestamp) && latest.publishTimestamp >= 0, `${pkg.name}: publishTimestamp must be Unix seconds`);
    check(latest.source?.type === 'git', `${pkg.name}: source.type must be git`);
    check(/^[0-9a-f]{40}$/u.test(latest.source?.commit ?? ''), `${pkg.name}: source.commit must be a 40-hex commit`);
    let gitUrl;
    try { gitUrl = new URL(latest.source?.url ?? ''); } catch { gitUrl = undefined; }
    check(gitUrl !== undefined && gitUrl.protocol === 'https:' && !/\.(?:tgz|tar\.gz)$/iu.test(gitUrl.pathname), `${pkg.name}: source.url must be an https Git URL`);
    check(typeof latest.engines?.dsh === 'string' && latest.engines.dsh.trim() !== '', `${pkg.name}: engines.dsh is required`);
    const iconPath = resolve(root, 'market', entry.icon ?? '');
    check(entry.icon !== undefined, `${pkg.name}: icon is required`);
    let iconExists = false;
    try { readFileSync(iconPath); iconExists = true; } catch {/* reported below */}
    check(iconExists, `${pkg.name}: icon ${entry.icon ?? ''} must resolve to a file in the repository`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(` - ${problem}`);
  console.error(`RESULT: ${problems.length} market problem(s)`);
  process.exit(1);
}
console.log('RESULT: market index checks passed');
