/**
 * Build client.js from src/client.template.js + research/palettes.json.
 *
 * The browser module loader cannot import local files, so palette data is
 * inlined as a JSON literal. Run: node build/build-client.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const research = JSON.parse(fs.readFileSync(path.join(root, 'research', 'palettes.json'), 'utf8'));

const MODE_KEYS = [
  'bgBase', 'bgLayer1', 'bgLayer2', 'bgOverlay', 'borderL1', 'borderL2',
  'brandPrimary', 'labelPrimary', 'labelSecondary', 'stateError', 'stateIdle',
  'stateSuccess', 'stateWarn', 'sidebarFill',
];

function pickAnchors(mode, theme, modeName) {
  const picked = {};
  for (const key of MODE_KEYS) {
    const value = mode[key];
    if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
      throw new Error(`theme ${theme.id}.${modeName}.${key} is not a 6-digit hex color: ${value}`);
    }
    picked[key] = value;
  }
  return picked;
}

const themes = research.themes.map((theme) => ({
  // The research "default" is a warmed variant; the panel's own Default entry is
  // the stock harness look (no override layer), so expose this one as "warm".
  id: theme.id === 'default' ? 'warm' : theme.id,
  light: pickAnchors(theme.light, theme, 'light'),
  dark: pickAnchors(theme.dark, theme, 'dark'),
}));

const ids = new Set(themes.map((theme) => theme.id));
if (ids.size !== themes.length) throw new Error('duplicate palette ids');

const template = fs.readFileSync(path.join(root, 'src', 'client.template.js'), 'utf8');
if (!template.includes('__PALETTES__')) throw new Error('client template is missing the __PALETTES__ placeholder');
const built = template.split('__PALETTES__').join(JSON.stringify(themes));
fs.writeFileSync(path.join(root, 'client.js'), built, 'utf8');

console.log('built client.js:', built.length, 'bytes');
console.log('palettes:', themes.map((theme) => theme.id).join(', '));
