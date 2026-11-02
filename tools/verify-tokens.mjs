/**
 * Token-engine verification: load the built client module with mocked services,
 * capture the override layer each preference produces, and validate contrast and
 * consistency of the generated --dsw-* token values (including DIY palettes).
 * This executes the plugin body and the pure token generator only.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8');

function loadPlugin(pref) {
  let definition = null;
  const store = new Map();
  if (pref) store.set('dsh.personalization.v1', JSON.stringify(pref));
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(value) {
          definition = value;
        },
      },
      localStorage: {
        getItem(key) {
          return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
          store.set(key, String(value));
        },
      },
    },
    document: { addEventListener() {}, removeEventListener() {} },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'client.js' });
  if (!definition) throw new Error('module loader was not called');

  const react = {
    createElement: (...args) => ({ args }),
    Fragment: Symbol.for('react.fragment'),
    useState: () => [undefined, () => {}],
    useEffect: () => {},
    useSyncExternalStore: () => undefined,
  };
  const exported = definition.factory((name) => {
    if (name === 'react') return react;
    throw new Error('unexpected require: ' + name);
  });

  const overrides = [];
  const theme = {
    overrideTokens(sourceName, tokens) {
      overrides.push({ source: sourceName, tokens });
      return () => {};
    },
    getTheme() {
      return { fontSizes: { text: 14, code: 11, terminal: 13 }, preference: 'system' };
    },
    setFontSize() {},
    setTheme() {},
  };
  const ctx = {
    theme,
    locale: { register: () => () => {}, bind: () => (key) => key },
    effect: (callback) => {
      const disposer = callback();
      return typeof disposer === 'function' ? disposer : () => {};
    },
    on: () => () => {},
    slots: {
      inject(key, callback) {
        callback();
        return () => {};
      },
      register() {
        return () => {};
      },
    },
  };
  exported.apply(ctx);
  return { exported, overrides };
}

/* -------------------------------------------------------------------- */
/* Independent color math for verification                               */
/* -------------------------------------------------------------------- */

function parse(hex) {
  const raw = String(hex).replace('#', '');
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}
function lum(hex) {
  const c = parse(hex);
  const f = (v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function ratio(a, b) {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const REQUIRED_TOKENS = [
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-overlay',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-brand-primary',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-idle-primary',
  '--dsw-alias-state-success-primary',
  '--dsw-alias-state-warn-primary',
  '--dsw-specific-sidebar-fill',
];

const presets = JSON.parse(
  fs.readFileSync(path.join(root, 'research', 'palettes.json'), 'utf8'),
).themes.map((theme) => (theme.id === 'default' ? 'warm' : theme.id));

const cases = presets.map((palette) => ({ label: palette, pref: { palette, latin: 'system', cjk: 'system', code: 'default' } }));
const DIY = {
  light: { bg: '#FDF6EC', accent: '#7A5AF8' },
  dark: { bg: '#101418', accent: '#7A5AF8' },
  error: null,
  success: null,
  warn: null,
  bold: false,
};
const DIY_BOLD = Object.assign({}, DIY, { bold: true });
const DIY_FULL = {
  light: { bg: '#FDF6EC', layer: '#FFF9EF', overlay: '#FFFDF8', sidebar: '#F6EFE3', label: '#2A2419', border: '#D8CDBB', accent: '#7A5AF8' },
  dark: { bg: '#101418', layer: '#181D24', overlay: '#1E242C', sidebar: '#0B0E12', label: '#E9E3D8', border: '#3A4148', accent: '#4C5BD9' },
  error: '#A8001E',
  success: '#1E7B3C',
  warn: '#8F6400',
  bold: false,
};
cases.push({ label: 'custom', pref: { palette: 'custom', latin: 'system', cjk: 'system', code: 'default', custom: DIY } });
cases.push({ label: 'custom-bold', pref: { palette: 'custom', latin: 'system', cjk: 'system', code: 'default', custom: DIY_BOLD } });
cases.push({ label: 'custom-full', pref: { palette: 'custom', latin: 'system', cjk: 'system', code: 'default', custom: DIY_FULL } });

const problems = [];
const rows = [];
let referenceNames = null;
const layers = new Map();

for (const testCase of cases) {
  const { overrides } = loadPlugin(testCase.pref);
  if (overrides.length !== 1) {
    problems.push(`${testCase.label}: expected exactly one theme layer, got ${overrides.length}`);
    continue;
  }
  const layer = overrides[0];
  layers.set(testCase.label, layer.tokens);
  if (layer.source !== '@local/dsh-personalization') problems.push(`${testCase.label}: unexpected layer source ${layer.source}`);

  const names = Object.keys(layer.tokens);
  if (!referenceNames) referenceNames = names.slice().sort();
  else if (names.slice().sort().join('|') !== referenceNames.join('|')) {
    problems.push(`${testCase.label}: token name set differs from other palettes`);
  }
  for (const name of REQUIRED_TOKENS) {
    if (!layer.tokens[name]) problems.push(`${testCase.label}: missing required token ${name}`);
  }

  const valueOf = (name, mode) => (layer.tokens[name] ? layer.tokens[name][mode] : '');

  for (const mode of ['light', 'dark']) {
    const bad = names.filter((name) => {
      const entry = layer.tokens[name];
      return (
        !entry ||
        typeof entry.light !== 'string' ||
        typeof entry.dark !== 'string' ||
        entry[mode] === '' ||
        /undefined|NaN|null/.test(entry[mode])
      );
    });
    if (bad.length > 0) problems.push(`${testCase.label}.${mode}: invalid values in ${bad.join(', ')}`);

    const bg = valueOf('--dsw-alias-bg-base', mode);
    const label = valueOf('--dsw-alias-label-primary', mode);
    const label2 = valueOf('--dsw-alias-label-secondary', mode);
    const brand = valueOf('--dsw-alias-brand-primary', mode);
    const sidebar = valueOf('--dsw-specific-sidebar-fill', mode);
    const layer2 = valueOf('--dsw-alias-bg-layer-2', mode);
    const border1 = valueOf('--dsw-alias-border-l1', mode);
    const border2 = valueOf('--dsw-alias-border-l2', mode);

    const checks = {
      label: ratio(label, bg),
      secondary: ratio(label2, bg),
      brand: ratio(brand, bg),
      brandText: ratio(valueOf('--dsw-alias-brand-text', mode), brand),
      sidebar: ratio(sidebar, bg),
      layer2: ratio(layer2, bg),
      border2: ratio(border2, bg),
    };
    if (checks.label < 10) problems.push(`${testCase.label}.${mode}: label/bg contrast ${checks.label.toFixed(2)} < 10`);
    if (checks.secondary < 4.5) problems.push(`${testCase.label}.${mode}: secondary/bg contrast ${checks.secondary.toFixed(2)} < 4.5`);
    if (checks.brand < 3) problems.push(`${testCase.label}.${mode}: brand/bg contrast ${checks.brand.toFixed(2)} < 3`);
    if (checks.brandText < 4.4) problems.push(`${testCase.label}.${mode}: brandText/brand contrast ${checks.brandText.toFixed(2)} < 4.4`);
    if (checks.sidebar < 1.01 || checks.sidebar > 1.6) problems.push(`${testCase.label}.${mode}: sidebar/bg contrast ${checks.sidebar.toFixed(2)} out of band`);
    if (checks.border2 <= ratio(border1, bg)) problems.push(`${testCase.label}.${mode}: border-l2 not stronger than border-l1`);
    for (const state of ['error', 'success', 'warn']) {
      const value = valueOf(`--dsw-alias-state-${state}-primary`, mode);
      const stateRatio = ratio(value, bg);
      if (stateRatio < 4.4) problems.push(`${testCase.label}.${mode}: ${state} contrast ${stateRatio.toFixed(2)} < 4.4`);
    }

    rows.push({
      case: testCase.label,
      mode,
      label: checks.label.toFixed(1),
      secondary: checks.secondary.toFixed(1),
      brand: checks.brand.toFixed(1),
      brandTx: checks.brandText.toFixed(1),
      sidebar: checks.sidebar.toFixed(2),
      border2: checks.border2.toFixed(2),
      tokens: names.length,
    });
  }
}

/* DIY-specific assertions. */
const custom = layers.get('custom');
const customBold = layers.get('custom-bold');
const customFull = layers.get('custom-full');
if (!custom || !customBold || !customFull) {
  problems.push('DIY palette layers missing');
} else {
  if (custom['--dsw-alias-bg-base'].light !== DIY.light.bg) problems.push('DIY light background not used verbatim');
  if (custom['--dsw-alias-bg-base'].dark !== DIY.dark.bg) problems.push('DIY dark background not used verbatim');
  if (custom['--dsw-alias-brand-primary'].light !== DIY.light.accent) {
    // The accent is nudged only when it cannot reach 3:1 against the background.
    const adjusted = custom['--dsw-alias-brand-primary'].light;
    if (ratio(adjusted, DIY.light.bg) < 3) problems.push('DIY accent adjusted without reaching 3:1');
  }
  const plainBorder = ratio(custom['--dsw-alias-border-l2'].light, custom['--dsw-alias-bg-base'].light);
  const boldBorder = ratio(customBold['--dsw-alias-border-l2'].light, customBold['--dsw-alias-bg-base'].light);
  if (!(boldBorder > plainBorder)) problems.push(`bold borders do not strengthen border tokens (${plainBorder.toFixed(2)} vs ${boldBorder.toFixed(2)})`);

  const expectToken = (label, tokens, token, mode, expected) => {
    const actual = tokens[token] ? tokens[token][mode] : undefined;
    if (actual !== expected) problems.push(`${label}.${mode}: ${token} = ${actual}, expected ${expected}`);
  };
  expectToken('custom-full', customFull, '--dsw-alias-bg-base', 'light', DIY_FULL.light.bg);
  expectToken('custom-full', customFull, '--dsw-alias-bg-base', 'dark', DIY_FULL.dark.bg);
  expectToken('custom-full', customFull, '--dsw-alias-bg-layer-1', 'light', DIY_FULL.light.layer);
  expectToken('custom-full', customFull, '--dsw-alias-bg-layer-1', 'dark', DIY_FULL.dark.layer);
  expectToken('custom-full', customFull, '--dsw-alias-bg-overlay', 'light', DIY_FULL.light.overlay);
  expectToken('custom-full', customFull, '--dsw-alias-bg-overlay', 'dark', DIY_FULL.dark.overlay);
  expectToken('custom-full', customFull, '--dsw-specific-sidebar-fill', 'light', DIY_FULL.light.sidebar);
  expectToken('custom-full', customFull, '--dsw-specific-sidebar-fill', 'dark', DIY_FULL.dark.sidebar);
  expectToken('custom-full', customFull, '--dsw-alias-label-primary', 'light', DIY_FULL.light.label);
  expectToken('custom-full', customFull, '--dsw-alias-label-primary', 'dark', DIY_FULL.dark.label);
  expectToken('custom-full', customFull, '--dsw-alias-border-l2', 'light', DIY_FULL.light.border);
  expectToken('custom-full', customFull, '--dsw-alias-border-l2', 'dark', DIY_FULL.dark.border);
  expectToken('custom-full', customFull, '--dsw-alias-brand-primary', 'light', DIY_FULL.light.accent);
  expectToken('custom-full', customFull, '--dsw-alias-brand-primary', 'dark', DIY_FULL.dark.accent);
  expectToken('custom-full', customFull, '--dsw-alias-state-error-primary', 'light', DIY_FULL.error);
  expectToken('custom-full', customFull, '--dsw-alias-state-success-primary', 'light', DIY_FULL.success);
  expectToken('custom-full', customFull, '--dsw-alias-state-warn-primary', 'light', DIY_FULL.warn);
}

/* Default state must not register any layer; font-only must register exactly one token. */
{
  const { overrides } = loadPlugin(null);
  if (overrides.length !== 0) problems.push(`default state: expected no override layer, got ${overrides.length}`);
}
{
  const { overrides } = loadPlugin({ palette: 'none', latin: 'serif', cjk: 'serif', code: 'jetbrains' });
  if (overrides.length !== 1) problems.push('font-only: expected one override layer');
  else {
    const names = Object.keys(overrides[0].tokens);
    if (names.length !== 2 || !names.includes('--dsh-font-family-text') || !names.includes('--dsh-font-family-code')) {
      problems.push('font-only: expected exactly the two font tokens, got ' + names.join(', '));
    }
    const text = overrides[0].tokens['--dsh-font-family-text'].light;
    if (!/Noto Serif SC/.test(text) || !/Georgia/.test(text)) problems.push('font-only: serif stack is incomplete: ' + text);
  }
}

console.log('palettes checked:', presets.length, '| DIY cases: 3 | token names:', referenceNames ? referenceNames.length : 0);
const header = ['case', 'mode', 'label', 'second', 'brand', 'brandTx', 'sidebar', 'b2', 'tokens'];
console.log(header.map((h) => h.padEnd(12)).join(''));
for (const row of rows) {
  console.log(
    [row.case, row.mode, row.label, row.secondary, row.brand, row.brandTx, row.sidebar, row.border2, String(row.tokens)]
      .map((value) => String(value).padEnd(12))
      .join(''),
  );
}
if (problems.length > 0) {
  console.error('\nPROBLEMS (' + problems.length + '):');
  for (const problem of problems) console.error(' - ' + problem);
  process.exitCode = 1;
} else {
  console.log('\nOK: all palettes (including DIY) and states pass the token checks.');
}
