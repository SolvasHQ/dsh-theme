/**
 * Functional smoke check for the personalization panel (no browser control).
 *
 * Loads the built client module in a VM with a mini hook runtime, mocked theme /
 * locale / slot services, recursively renders the registered components, fires
 * their handlers, and asserts preference, token layer, light/dark writes, DIY
 * editing, bilingual copy, and persistence behavior. This verifies the plugin
 * body; it is not a visual verification of the running page.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8');

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

/* ------------------------- mini hook runtime ------------------------- */

const FRAGMENT = Symbol.for('react.fragment');
let activeRuntime = null;

function createElement(type, props, ...children) {
  const merged = Object.assign({}, props || {});
  if (children.length === 1) merged.children = children[0];
  else if (children.length > 1) merged.children = children;
  return { type, props: merged };
}

class HookRuntime {
  constructor(component) {
    this.component = component;
    this.states = [];
    this.mounted = false;
    this.effectErrors = [];
    this.pendingEffects = [];
  }

  render(props) {
    const previous = activeRuntime;
    activeRuntime = this;
    this.hookIndex = 0;
    this.pendingEffects = [];
    try {
      const tree = this.component(props);
      if (!this.mounted) {
        this.mounted = true;
        for (const effect of this.pendingEffects) {
          try {
            effect();
          } catch (error) {
            this.effectErrors.push(error);
          }
        }
      }
      return tree;
    } finally {
      activeRuntime = previous;
    }
  }

  hook(fn) {
    const index = this.hookIndex++;
    return fn(index);
  }
}

const react = {
  createElement,
  Fragment: FRAGMENT,
  useState(initial) {
    if (!activeRuntime) throw new Error('useState outside a render');
    const runtime = activeRuntime;
    return runtime.hook((index) => {
      if (!(index in runtime.states)) {
        runtime.states[index] = typeof initial === 'function' ? initial() : initial;
      }
      const set = (value) => {
        const next = typeof value === 'function' ? value(runtime.states[index]) : value;
        if (Object.is(next, runtime.states[index])) return;
        runtime.states[index] = next;
        if (runtime.onChange) runtime.onChange();
      };
      return [runtime.states[index], set];
    });
  },
  useEffect(fn) {
    if (!activeRuntime) return;
    const runtime = activeRuntime;
    if (!runtime.mounted) runtime.pendingEffects.push(fn);
  },
  useLayoutEffect(fn) {
    if (!activeRuntime) return;
    const runtime = activeRuntime;
    if (!runtime.mounted) runtime.pendingEffects.push(fn);
  },
  useRef(initial) {
    const runtime = activeRuntime;
    return runtime.hook((index) => {
      if (!(index in runtime.states)) runtime.states[index] = { current: initial };
      return runtime.states[index];
    });
  },
  useMemo(fn) {
    return fn();
  },
  useCallback(fn) {
    return fn;
  },
  useSyncExternalStore(subscribe, getSnapshot) {
    return getSnapshot();
  },
};

/* --------------------------- tree helpers --------------------------- */

function walk(node, visit) {
  if (node === null || node === undefined || typeof node === 'boolean') return;
  if (typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  if (typeof node !== 'object' || node.type === undefined) return;
  visit(node);
  walk(node.props ? node.props.children : undefined, visit);
}

function textOf(node) {
  const out = [];
  walk(node, (item) => {
    const children = item.props ? item.props.children : undefined;
    if (typeof children === 'string' || typeof children === 'number') out.push(String(children));
  });
  return out.join(' ');
}

function findAll(tree, predicate) {
  const hits = [];
  walk(tree, (node) => {
    try {
      if (predicate(node)) hits.push(node);
    } catch (error) {
      /* predicate may touch missing props */
    }
  });
  return hits;
}

function byClass(tree, className) {
  return findAll(tree, (node) => {
    const value = node.props ? node.props.className : undefined;
    return typeof value === 'string' && value.split(/\s+/).includes(className);
  });
}

function byText(tree, text) {
  return findAll(tree, (node) => {
    const children = node.props ? node.props.children : undefined;
    return typeof children === 'string' && children === text;
  });
}

function switchButton(tree) {
  return findAll(tree, (node) => node.type === 'button' && node.props && node.props.role === 'switch')[0];
}

function styleTags(tree) {
  return findAll(tree, (node) => node.type === 'style').map((node) => {
    const html = node.props && node.props.dangerouslySetInnerHTML;
    return html && typeof html.__html === 'string' ? html.__html : '';
  });
}

function makeRenderer() {
  const runtimes = new Map();
  let rerender = null;

  function renderNode(node) {
    if (node === null || node === undefined || typeof node === 'boolean') return node;
    if (typeof node === 'string' || typeof node === 'number') return node;
    if (Array.isArray(node)) return node.map(renderNode);
    if (typeof node !== 'object' || node.type === undefined) return node;
    const props = node.props || {};
    if (node.type === FRAGMENT) return renderNode(props.children);
    if (typeof node.type === 'function') {
      let runtime = runtimes.get(node.type);
      if (!runtime) {
        runtime = new HookRuntime(node.type);
        runtimes.set(node.type, runtime);
      }
      runtime.onChange = () => {
        if (typeof rerender === 'function') rerender();
      };
      return renderNode(runtime.render(props));
    }
    if (props.children !== undefined) {
      return { type: node.type, props: Object.assign({}, props, { children: renderNode(props.children) }) };
    }
    return { type: node.type, props };
  }

  function render(component, props) {
    rerender = () => render(component, props);
    return renderNode(createElement(component, props));
  }

  return { render, runtimes };
}

/* --------------------------- service mocks --------------------------- */

function createHarness(initialStorage, hostPreferences) {
  let definition = null;
  const store = new Map();
  if (initialStorage) store.set('dsh.theme.v1', initialStorage);
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
    document: {
      addEventListener() {},
      removeEventListener() {},
    },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'client.js' });
  if (!definition) throw new Error('module loader was not called');

  const themeCalls = [];
  const themeListeners = [];
  const dictionaries = {};
  const slotRegistrations = { footer: [], overlay: [], section: [], icon: [] };
  const hostWrites = [];
  const requestedEntryIds = [];
  const hostScope = {
    getSnapshot: () => ({
      status: 'ready',
      value: { preferences: hostPreferences === undefined ? '' : hostPreferences },
      revision: 0,
    }),
    subscribe: () => () => {},
    set: (field, value) => {
      hostWrites.push({ field, value });
      return Promise.resolve(true);
    },
  };
  const configForms = {
    get(entryId) {
      requestedEntryIds.push(entryId);
      return hostScope;
    },
  };
  let fontSize = 14;
  let preference = 'system';
  const snapshot = () => ({ fontSizes: { text: fontSize, code: 11, terminal: 13 }, preference });
  const theme = {
    overrideTokens(sourceName, tokens) {
      themeCalls.push({ source: sourceName, tokens });
      return () => {};
    },
    getTheme: snapshot,
    setFontSize(role, px) {
      fontSize = px;
      for (const listener of themeListeners) listener(snapshot());
    },
    setTheme(id) {
      preference = id;
      for (const listener of themeListeners) listener(snapshot());
    },
  };
  const ctx = {
    theme,
    get(name) {
      return name === 'configForms' ? configForms : undefined;
    },
    locale: {
      register: (namespace, dicts) => {
        dictionaries[namespace] = dicts;
        return () => {};
      },
      bind: () => (key) => key,
    },
    effect: (callback) => {
      const disposer = callback();
      return typeof disposer === 'function' ? disposer : () => {};
    },
    on: (name, listener) => {
      if (name === 'theme/change') themeListeners.push(listener);
      return () => {};
    },
    slots: {
      inject(key, callback) {
        callback();
        return () => {};
      },
      register(options, Component) {
        if (options.name === 'sidebar.footer.action') slotRegistrations.footer.push(Component);
        if (options.name === 'shell.overlay') slotRegistrations.overlay.push(Component);
        if (options.name === 'settings.section') slotRegistrations.section.push(Component);
        if (options.name === 'settings.section.icon') slotRegistrations.icon.push(Component);
        return () => {};
      },
    },
  };

  const exported = definition.factory((name) => {
    if (name === 'react') return react;
    throw new Error('unexpected require: ' + name);
  });
  exported.apply(ctx);

  return {
    exported,
    theme,
    themeCalls,
    dictionaries,
    slotRegistrations,
    storage: store,
    hostWrites,
    requestedEntryIds,
    fontSize: () => fontSize,
    preference: () => preference,
  };
}

const t = (key) => key;
const translateWith = (dict) => (key) => (dict && dict[key] !== undefined ? dict[key] : key);
const CJK = /[\u4e00-\u9fff]/;

function relativeLuminance(hex) {
  const raw = String(hex).replace('#', '');
  const values = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16) / 255);
  const linear = values.map((value) =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a, b) {
  const left = relativeLuminance(a);
  const right = relativeLuminance(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

/* ------------------------------- tests ------------------------------- */

const harness = createHarness(null);
check(harness.exported.inject.includes('theme'), 'module injects the theme service');
check(harness.exported.inject.includes('locale'), 'module injects the locale service');
check(harness.slotRegistrations.footer.length === 1, 'sidebar footer action registered');
check(harness.slotRegistrations.overlay.length === 1, 'shell overlay registered');
check(harness.slotRegistrations.section.length === 1, 'settings section registered');
check(harness.slotRegistrations.icon.length === 1, 'settings section icon registered');

const dicts = harness.dictionaries['dsh.theme'];
check(Boolean(dicts && dicts.zh && dicts.en), 'locale dictionaries registered for zh and en');
if (dicts && dicts.zh && dicts.en) {
  const zhKeys = Object.keys(dicts.zh).sort();
  const enKeys = Object.keys(dicts.en).sort();
  check(zhKeys.join('|') === enKeys.join('|'), 'zh and en dictionaries share one key set');
  const missing = zhKeys.filter((key) => !dicts.en[key]);
  check(missing.length === 0, 'every key has an English string');
  check(dicts.zh.section === '主题' && dicts.en.section === 'Theme', 'settings section label is Theme');
}

const Trigger = harness.slotRegistrations.footer[0];
const Overlay = harness.slotRegistrations.overlay[0];
const SettingsPage = harness.slotRegistrations.section[0];

const renderer = makeRenderer();
const iconTree = renderer.render(harness.slotRegistrations.icon[0], { size: 16, active: true });
check(findAll(iconTree, (node) => node.type === 'svg').length === 1, 'settings icon renders an svg');
check(findAll(iconTree, (node) => node.type === 'circle').length === 4, 'settings icon draws the palette ring and dots');
let triggerTree = renderer.render(Trigger, { t, wide: true });
let triggerButtons = findAll(triggerTree, (node) => node.type === 'button');
check(triggerButtons.length === 1, 'trigger renders one button');
check(triggerButtons[0].props['aria-expanded'] === false, 'trigger starts collapsed');
check(triggerButtons[0].props['data-dsph-trigger'] === '', 'trigger carries its data marker');
check(String(triggerButtons[0].props.className).includes('dsph-trigger'), 'trigger uses the plugin class');

triggerButtons[0].props.onClick();
triggerButtons = findAll(renderer.render(Trigger, { t, wide: true }), (node) => node.type === 'button');
check(triggerButtons[0].props['aria-expanded'] === true, 'trigger expands after click');

let tree = renderer.render(Overlay, { t });
check(byClass(tree, 'dsph-panel').length === 1, 'overlay renders the panel when open');
check(byText(tree, 'title').length >= 1, 'panel renders its title');
check(byClass(tree, 'dsph-mode').length === 3, 'panel renders the light/dark/system control');
check(byClass(tree, 'dsph-theme').length === 15, 'panel renders fifteen theme cards (incl. custom)');
check(byClass(tree, 'dsph-selectButton').length === 3, 'panel renders three font selects');
check(byClass(tree, 'dsph-slider').length === 1, 'panel renders the text-size slider');
check(byText(tree, '100%').length === 1, 'text size starts at 100%');
check(byClass(tree, 'dsph-reset').length === 1, 'reset sits in the panel header');
check(byClass(tree, 'dsph-foot').length === 0 && byClass(tree, 'dsph-footNote').length === 0, 'no footer row is rendered');

// --- light / dark / system control ---
const darkButton = byClass(tree, 'dsph-mode').find((node) => byText(node, 'mode.dark').length > 0);
check(Boolean(darkButton), 'dark mode button exists');
darkButton.props.onClick();
check(harness.preference() === 'dark', 'dark mode writes through theme.setTheme');
tree = renderer.render(Overlay, { t });
const pressedMode = byClass(tree, 'dsph-mode').filter((node) => node.props['aria-pressed'] === true);
check(pressedMode.length === 1 && byText(pressedMode[0], 'mode.dark').length === 1, 'dark mode button is marked pressed');
byClass(tree, 'dsph-mode').find((node) => byText(node, 'mode.system').length > 0).props.onClick();
check(harness.preference() === 'system', 'system mode writes through theme.setTheme');

// --- close / reopen ---
byClass(tree, 'dsph-close')[0].props.onClick();
check(byClass(renderer.render(Overlay, { t }), 'dsph-panel').length === 0, 'close button hides the panel');
triggerButtons = findAll(renderer.render(Trigger, { t, wide: true }), (node) => node.type === 'button');
triggerButtons[0].props.onClick();
tree = renderer.render(Overlay, { t });
check(byClass(tree, 'dsph-panel').length === 1, 'trigger reopens the panel');

// --- pick the Claude palette ---
const claudeCard = findAll(tree, (node) => node.type === 'button' && node.props.title === 'theme.claude');
check(claudeCard.length === 1, 'Claude theme card exists');
claudeCard[0].props.onClick();
tree = renderer.render(Overlay, { t });
let layer = harness.themeCalls[harness.themeCalls.length - 1];
check(Boolean(layer), 'picking a palette registers a theme layer');
check(layer.tokens['--dsw-alias-bg-base'].light === '#FAF8F1', 'Claude light base token applied');
check(layer.tokens['--dsw-alias-bg-base'].dark === '#1F1E1B', 'Claude dark base token applied');
check(harness.storage.get('dsh.theme.v1').includes('"palette":"claude"'), 'palette choice persisted');
check(byClass(tree, 'dsph-theme').filter((node) => node.props['aria-pressed'] === true).length === 1, 'exactly one theme card is pressed');
const claudeTriggerTree = renderer.render(Trigger, { t, wide: true });
check(
  findAll(claudeTriggerTree, (node) => node.props && String(node.props.className || '').includes('dsph-triggerDot')).length === 1,
  'an active preset shows the trigger dot',
);
check(harness.requestedEntryIds.includes('dsh-theme'), 'the client opens the Host settings form for its entry id');
check(
  harness.hostWrites.some((write) => write.field === 'preferences' && write.value.includes('"palette":"claude"')),
  'a palette choice is written to the durable Host settings document',
);

// --- DIY mode: the full color editor ---
const customCard = findAll(tree, (node) => node.type === 'button' && node.props.title === 'theme.custom');
check(customCard.length === 1, 'Custom theme card exists');
const customSwatch = findAll(
  customCard[0],
  (node) => node.props && String(node.props.className || '').split(/\s+/).includes('dsph-swatch'),
)[0];
check(
  Boolean(customSwatch) && String(customSwatch.props.style.background).includes('#FAF8F1'),
  'the Custom theme card renders its own color swatch',
);
customCard[0].props.onClick();
tree = renderer.render(Overlay, { t });
check(byClass(tree, 'dsph-editor').length === 1, 'custom card opens the DIY editor view');
check(byClass(tree, 'dsph-theme').length === 0, 'the DIY editor replaces the preset grid');
check(byClass(tree, 'dsph-modeTab').length === 2, 'the DIY editor has light/dark tabs');
check(byClass(tree, 'dsph-colorInput').length === 10, 'the DIY editor exposes seven mode colors plus three state colors');
check(byClass(tree, 'dsph-colorsTitle').length === 1, 'the DIY editor groups the state colors');
check(byClass(tree, 'dsph-switchRow').length === 1, 'custom editor has the bold-border row');
check(byClass(tree, 'dsph-switchRow')[0].props.onClick === undefined, 'the bold-border label row is not clickable');
check(Boolean(switchButton(tree)), 'the bold-border switch is its own control');
check(Boolean(byClass(tree, 'dsph-back')[0]), 'the DIY editor has a back button');
check(byClass(tree, 'dsph-auto').length === 0, 'the DIY editor has no separate Auto button');

let inputs = byClass(tree, 'dsph-colorInput');
check(inputs[0].props.value === '#FAF8F1', 'DIY light background starts from the saved definition');
const autoCardColor = inputs[1].props.value;
check(typeof autoCardColor === 'string' && autoCardColor.startsWith('#'), 'an unpinned card color shows a derived value');

inputs[0].props.onChange({ target: { value: '#FDF6EC' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-bg-base'].light === '#FDF6EC', 'DIY background reaches the token layer');
inputs = byClass(tree, 'dsph-colorInput');
check(inputs[1].props.value !== autoCardColor, 'an unpinned card color follows the background automatically');
check(harness.storage.get('dsh.theme.v1').includes('"bg":"#FDF6EC"'), 'DIY background persisted');

inputs[1].props.onChange({ target: { value: '#FFF9EF' } });
tree = renderer.render(Overlay, { t });
byClass(tree, 'dsph-colorInput')[3].props.onChange({ target: { value: '#F6EFE3' } });
tree = renderer.render(Overlay, { t });
byClass(tree, 'dsph-colorInput')[4].props.onChange({ target: { value: '#2A2419' } });
tree = renderer.render(Overlay, { t });
byClass(tree, 'dsph-colorInput')[5].props.onChange({ target: { value: '#D8CDBB' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-bg-layer-1'].light === '#FFF9EF', 'DIY card color reaches layer-1');
check(layer.tokens['--dsw-specific-sidebar-fill'].light === '#F6EFE3', 'DIY sidebar color reaches the sidebar token');
check(layer.tokens['--dsw-alias-label-primary'].light === '#2A2419', 'DIY text color reaches the label token');
check(layer.tokens['--dsw-alias-border-l2'].light === '#D8CDBB', 'DIY border color reaches the border token');

// The accent belongs to the mode being edited.
inputs = byClass(tree, 'dsph-colorInput');
inputs[6].props.onChange({ target: { value: '#7A5AF8' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-brand-primary'].light === '#7A5AF8', 'the light accent reaches the light brand token');

byClass(tree, 'dsph-modeTab')[1].props.onClick();
tree = renderer.render(Overlay, { t });
check(byClass(tree, 'dsph-modeTab')[1].props['aria-pressed'] === true, 'the dark tab is selectable');
inputs = byClass(tree, 'dsph-colorInput');
check(inputs[0].props.value === '#1F1E1B', 'the dark tab shows the dark background');
check(inputs[6].props.value === '#BB5A38', 'the dark accent is independent from the light accent');
inputs[2].props.onChange({ target: { value: '#1E242C' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-bg-overlay'].dark === '#1E242C', 'DIY popover color reaches the overlay token');

inputs = byClass(tree, 'dsph-colorInput');
inputs[6].props.onChange({ target: { value: '#4C5BD9' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-brand-primary'].dark === '#4C5BD9', 'the dark accent reaches the dark brand token');
check(layer.tokens['--dsw-alias-brand-primary'].light === '#7A5AF8', 'the light accent is unaffected by the dark tab');
check(
  harness.storage.get('dsh.theme.v1').includes('"accent":"#7A5AF8"') &&
    harness.storage.get('dsh.theme.v1').includes('"accent":"#4C5BD9"'),
  'both per-mode accents persist independently',
);

byClass(tree, 'dsph-colorInput')[7].props.onChange({ target: { value: '#A8001E' } });
tree = renderer.render(Overlay, { t });
byClass(tree, 'dsph-colorInput')[8].props.onChange({ target: { value: '#1E7B3C' } });
tree = renderer.render(Overlay, { t });
byClass(tree, 'dsph-colorInput')[9].props.onChange({ target: { value: '#8F6400' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-state-error-primary'].light === '#A8001E', 'DIY error color reaches the error token');
check(layer.tokens['--dsw-alias-state-success-primary'].light === '#1E7B3C', 'DIY success color reaches the success token');
check(layer.tokens['--dsw-alias-state-warn-primary'].light === '#8F6400', 'DIY warning color reaches the warning token');

check(switchButton(tree).props['aria-checked'] === false, 'bold borders start off');
check(styleTags(tree).some((css) => css.includes('border-width')) === false, 'bold CSS is absent before enabling');
switchButton(tree).props.onClick();
tree = renderer.render(Overlay, { t });
check(switchButton(tree).props['aria-checked'] === true, 'bold borders switch turns on');
check(styleTags(tree).some((css) => css.includes('border-width:1px')), 'bold CSS is injected while enabled');
switchButton(tree).props.onClick();
tree = renderer.render(Overlay, { t });
check(!styleTags(tree).some((css) => css.includes('border-width:1px')), 'bold CSS is removed when disabled');

// Custom theme management: naming/saving and cloning a preset base.
const customNameInput = byClass(tree, 'dsph-customName')[0];
check(Boolean(customNameInput), 'custom editor exposes a theme name input');
customNameInput.props.onChange({ target: { value: 'Mine' } });
tree = renderer.render(Overlay, { t });
const saveCustomButton = findAll(tree, (node) => node.type === 'button' && textOf(node) === 'custom.save')[0];
check(Boolean(saveCustomButton), 'custom editor exposes a save button');
saveCustomButton.props.onClick();
tree = renderer.render(Overlay, { t });
check(harness.storage.get('dsh.theme.v1').includes('"customName":"Mine"'), 'saving stores the custom theme name');
check(harness.storage.get('dsh.theme.v1').includes('"customs"'), 'saving stores the custom theme list');
const baseSelect = byClass(tree, 'dsph-nativeSelect')[0];
check(Boolean(baseSelect), 'custom editor exposes a preset base selector');
baseSelect.props.onChange({ target: { value: 'catppuccin' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsw-alias-bg-base'].light === '#EFF1F5', 'cloning Catppuccin as base applies its light background');

// Back returns to the preset grid with Custom still selected.
byClass(tree, 'dsph-back')[0].props.onClick();
tree = renderer.render(Overlay, { t });
check(byClass(tree, 'dsph-theme').length === 15, 'back returns to the preset grid');
check(
  byClass(tree, 'dsph-theme').filter((node) => node.props['aria-pressed'] === true).length === 1,
  'Custom stays the active theme after leaving the editor',
);
const customTriggerTree = renderer.render(Trigger, { t, wide: true });
check(
  findAll(customTriggerTree, (node) => node.props && String(node.props.className || '').includes('dsph-triggerDot')).length === 0,
  'a custom theme keeps the sidebar-foot trigger dot-free',
);

// --- font selection ---
byClass(tree, 'dsph-selectButton')[0].props.onClick();
tree = renderer.render(Overlay, { t });
let options = findAll(tree, (node) => node.props && node.props.role === 'option');
check(options.length === 7, 'Latin select opens with seven options');
const serifOption = options.find((node) => textOf(node) === 'font.latin.serif');
check(Boolean(serifOption), 'Latin serif option exists');
serifOption.props.onClick();
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(Boolean(layer.tokens['--dsh-font-family-text']), 'font choice adds the text font token');
check(layer.tokens['--dsh-font-family-text'].light.includes('Georgia'), 'Latin serif reaches the stack');
check(layer.tokens['--dsh-font-family-text'].light.includes('"PingFang SC"'), 'unselected CJK side keeps the shipped CJK stack');

byClass(tree, 'dsph-selectButton')[1].props.onClick();
tree = renderer.render(Overlay, { t });
options = findAll(tree, (node) => node.props && node.props.role === 'option');
check(options.length === 8, 'CJK select opens with eight options');
const kaiOption = options.find((node) => textOf(node) === 'font.cjk.kai');
check(Boolean(kaiOption), 'CJK WenKai option exists');
kaiOption.props.onClick();
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsh-font-family-text'].light.includes('LXGW WenKai'), 'CJK choice reaches the stack');

// A custom local font family reaches the text stack, with the default CJK side kept.
byClass(tree, 'dsph-selectButton')[0].props.onClick();
tree = renderer.render(Overlay, { t });
options = findAll(tree, (node) => node.props && node.props.role === 'option');
const customFontOption = options.find((node) => textOf(node) === 'font.latin.custom');
check(Boolean(customFontOption), 'Latin select offers a custom font option');
customFontOption.props.onClick();
tree = renderer.render(Overlay, { t });
const fontInput = byClass(tree, 'dsph-fontInput')[0];
check(Boolean(fontInput), 'custom font choice reveals a font-family input');
fontInput.props.onChange({ target: { value: '"My Local Font", sans-serif' } });
tree = renderer.render(Overlay, { t });
layer = harness.themeCalls[harness.themeCalls.length - 1];
check(layer.tokens['--dsh-font-family-text'].light.includes('"My Local Font"'), 'custom local font reaches the text stack');
check(layer.tokens['--dsh-font-family-text'].light.includes('LXGW WenKai'), 'custom Latin font keeps the selected CJK fallback');

// --- text size slider ---
const slider = byClass(tree, 'dsph-slider')[0];
check(slider.props.value === 14, 'slider reflects the theme service size');
slider.props.onChange({ target: { value: '18' } });
check(harness.fontSize() === 18, 'slider writes the text role size');
tree = renderer.render(Overlay, { t });
check(byText(tree, '129%').length === 1, 'size label follows the theme service (129%)');

// --- reset ---
byClass(tree, 'dsph-reset')[0].props.onClick();
tree = renderer.render(Overlay, { t });
check(harness.fontSize() === 14, 'reset restores the default text size');
check(harness.preference() === 'system', 'reset restores the system appearance preference');
check(harness.storage.get('dsh.theme.v1').includes('"palette":"none"'), 'reset clears the palette preference');
check(byText(tree, '100%').length === 1, 'reset returns the size label to 100%');

// --- settings page variant ---
const pageTree = renderer.render(SettingsPage, { t });
check(byClass(pageTree, 'dsph-page').length === 1, 'settings page renders the page shell');
check(byClass(pageTree, 'dsph-theme').length === 15, 'settings page renders the theme grid');
check(byClass(pageTree, 'dsph-mode').length === 3, 'settings page renders the mode control');
check(byClass(pageTree, 'dsph-slider').length === 1, 'settings page renders the size slider');

// --- English panel renders no Chinese copy ---
const enHarness = createHarness(null);
const enDict = enHarness.dictionaries['dsh.theme'].en;
const en = translateWith(enDict);
const enRenderer = makeRenderer();
const enTrigger = enHarness.slotRegistrations.footer[0];
const enOverlay = enHarness.slotRegistrations.overlay[0];
findAll(enRenderer.render(enTrigger, { t: en, wide: true }), (node) => node.type === 'button')[0].props.onClick();
const enTree = enRenderer.render(enOverlay, { t: en });
const enText = textOf(enTree);
check(enText.length > 80, 'English panel renders its copy');
check(!CJK.test(enText), 'English panel contains no Chinese copy');
check(enText.includes('Personalization') && enText.includes('Theme color') && enText.includes('Claude'), 'English panel uses the English dictionary');
const enCustomCard = findAll(enTree, (node) => node.type === 'button' && node.props.title === enDict['theme.custom']);
check(enCustomCard.length === 1, 'English panel offers the Custom card');
enCustomCard[0].props.onClick();
const enCustomText = textOf(enRenderer.render(enOverlay, { t: en }));
check(!CJK.test(enCustomText) && enCustomText.includes('Bold borders') && enCustomText.includes('Accent'), 'English DIY copy is present');
check(enCustomText.includes('Custom theme') && enCustomText.includes('Background'), 'English DIY editor is fully localized');

// --- Chinese panel still renders Chinese copy ---
const zhHarness = createHarness(null);
const zhDict = zhHarness.dictionaries['dsh.theme'].zh;
const zh = translateWith(zhDict);
const zhRenderer = makeRenderer();
const zhTrigger = zhHarness.slotRegistrations.footer[0];
const zhOverlay = zhHarness.slotRegistrations.overlay[0];
findAll(zhRenderer.render(zhTrigger, { t: zh, wide: true }), (node) => node.type === 'button')[0].props.onClick();
const zhText = textOf(zhRenderer.render(zhOverlay, { t: zh }));
check(CJK.test(zhText) && zhText.includes('主题色'), 'Chinese panel renders Chinese copy');

// --- font-only preference produces exactly the font token ---
const fontOnly = createHarness(JSON.stringify({ palette: 'none', latin: 'serif', cjk: 'serif', code: 'default' }));
check(fontOnly.themeCalls.length === 1, 'font-only preference registers one layer');
const fontOnlyTokens = Object.keys(fontOnly.themeCalls[0].tokens);
check(fontOnlyTokens.length === 1 && fontOnlyTokens[0] === '--dsh-font-family-text', 'font-only layer holds exactly the text font token');

// --- persisted custom preference is restored and re-applied ---
const restored = createHarness(
  JSON.stringify({
    palette: 'custom',
    latin: 'system',
    cjk: 'system',
    code: 'default',
    custom: { light: { bg: '#F2EEE3' }, dark: { bg: '#101418' }, accent: '#A33F1F', bold: true },
  }),
);
check(restored.themeCalls.length === 1, 'persisted custom palette registers a layer at load');
check(restored.themeCalls[0].tokens['--dsw-alias-bg-base'].light === '#F2EEE3', 'persisted DIY light background restored');
check(restored.themeCalls[0].tokens['--dsw-alias-bg-base'].dark === '#101418', 'persisted DIY dark background restored');
check(restored.themeCalls[0].tokens['--dsw-alias-brand-primary'].light === '#A33F1F', 'a legacy shared accent migrates into the light mode');
const restoredDarkBrand = restored.themeCalls[0].tokens['--dsw-alias-brand-primary'].dark;
check(
  /^#[0-9a-f]{6}$/i.test(restoredDarkBrand) && contrastRatio(restoredDarkBrand, '#101418') >= 3,
  'a legacy shared accent migrates into the dark mode with the contrast guard',
);

// --- v1 flat DIY data migrates into the expanded shape ---
const migrated = createHarness(
  JSON.stringify({ palette: 'custom', custom: { lightBg: '#F2EEE3', darkBg: '#101418', accent: '#A33F1F', bold: false } }),
);
check(migrated.themeCalls.length === 1, 'v1 DIY data still registers a layer');
check(migrated.themeCalls[0].tokens['--dsw-alias-bg-base'].light === '#F2EEE3', 'v1 light background migrates');
check(migrated.themeCalls[0].tokens['--dsw-alias-bg-base'].dark === '#101418', 'v1 dark background migrates');
const migratedDarkBrand = migrated.themeCalls[0].tokens['--dsw-alias-brand-primary'].dark;
check(
  /^#[0-9a-f]{6}$/i.test(migratedDarkBrand) && contrastRatio(migratedDarkBrand, '#101418') >= 3,
  'v1 accent migrates into the per-mode shape',
);

// --- durable Host preferences are adopted on the next app start ---
const restoredHost = createHarness(
  null,
  JSON.stringify({ palette: 'claude', latin: 'serif', cjk: 'kai', code: 'jetbrains' }),
);
check(restoredHost.themeCalls.length === 1, 'Host-persisted preferences register a theme layer at startup');
check(restoredHost.themeCalls[0].tokens['--dsw-alias-bg-base'].light === '#FAF8F1', 'Host preferences restore the palette at startup');
const restoredFont = restoredHost.themeCalls[0].tokens['--dsh-font-family-text'];
check(
  Boolean(restoredFont) && restoredFont.light.includes('Georgia') && restoredFont.light.includes('LXGW WenKai'),
  'Host preferences restore the font selection at startup',
);

// --- the Host document wins over a stale localStorage cache ---
const hostWins = createHarness(
  JSON.stringify({ palette: 'custom', latin: 'system', cjk: 'system', code: 'default' }),
  JSON.stringify({ palette: 'warm' }),
);
check(
  hostWins.themeCalls.length === 1 && hostWins.themeCalls[0].tokens['--dsw-alias-bg-base'].light === '#F8F7F4',
  'the Host document wins over the localStorage cache',
);

// --- existing localStorage preferences migrate into the Host document ---
const migratedSession = createHarness(
  JSON.stringify({ palette: 'claude', latin: 'humanist', cjk: 'system', code: 'default' }),
  '',
);
check(
  migratedSession.hostWrites.some(
    (write) =>
      write.field === 'preferences' &&
      write.value.includes('"palette":"claude"') &&
      write.value.includes('"latin":"humanist"'),
  ),
  'existing localStorage preferences migrate into the Host document',
);

// --- header reset restores DIY defaults, including both per-mode accents ---
const resetHarness = createHarness(
  null,
  JSON.stringify({
    palette: 'custom',
    latin: 'humanist',
    cjk: 'kai',
    code: 'default',
    custom: {
      light: { bg: '#FAF8F1', accent: '#7A5AF8' },
      dark: { bg: '#1F1E1B', accent: '#4C5BD9' },
      error: null,
      success: null,
      warn: null,
      bold: false,
    },
  }),
);
const resetRenderer = makeRenderer();
const resetTrigger = resetHarness.slotRegistrations.footer[0];
const resetOverlay = resetHarness.slotRegistrations.overlay[0];
findAll(resetRenderer.render(resetTrigger, { t, wide: true }), (node) => node.type === 'button')[0].props.onClick();
const resetTree = resetRenderer.render(resetOverlay, { t });
byClass(resetTree, 'dsph-reset')[0].props.onClick();
resetRenderer.render(resetOverlay, { t });
const resetWrite = resetHarness.hostWrites[resetHarness.hostWrites.length - 1];
const resetPrefs = JSON.parse(resetWrite.value);
check(resetPrefs.palette === 'none' && resetPrefs.latin === 'system', 'header reset restores the default appearance and fonts');
check(
  resetPrefs.custom.light.accent === '#BB5A38' && resetPrefs.custom.dark.accent === '#BB5A38',
  'header reset restores both per-mode accents',
);

const effectErrors = Array.from(renderer.runtimes.values()).reduce((sum, runtime) => sum + runtime.effectErrors.length, 0);
check(effectErrors === 0, 'component effects run without throwing');

console.log(lines.join('\n'));
console.log('\n' + (failed ? 'RESULT: FAILED' : 'RESULT: all panel checks passed'));
if (failed) process.exitCode = 1;
