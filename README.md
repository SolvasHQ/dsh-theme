# DSH Personalization

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)

Theme palettes, a full DIY color editor, fonts, and interface text size for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI —
switchable from a palette icon at the bottom-left of the sidebar.

Dark and light are first class: every preset and every DIY color carries a value
for both modes, so it keeps working when the native appearance switches between
light, dark, and system.

![Palette reference sheet](research/preview.png)

## Features

- **Bottom-left trigger** — a palette icon in the sidebar foot (row above
  Settings). One click opens a compact popover anchored bottom-left.
- **Settings page** — the same content is also a dedicated
  **个性化 / Personalization** page in Settings.
- **10 presets** — Default (stock harness), Warm, Mono, Claude, Claude+, Vermillion,
  Amber Mono, MX Brutalist, Tiesen, Vescrow, plus a **Custom** card.
- **DIY theme editor** — per light/dark mode: background, card, popover, sidebar,
  text, border, and that mode's accent color; shared error/success/warning colors;
  and a **Bold borders** switch (1 px borders everywhere + ink-strength border
  tokens). Unpinned slots derive from the background/text automatically.
- **Fonts** — independent Latin and Chinese stacks plus a code font, applied to
  interface, conversation, and code text.
- **Text size** — 10–22 px through the native theme service, so it survives
  reloads and shares the Ctrl/Cmd `+`/`-` shortcuts.
- **Bilingual UI** — follows the app language (Simplified Chinese / English).
- **Restart-safe persistence** — choices are stored in DSH's Host settings
  document, so they survive app restarts and profile changes of the localhost
  port. No `localStorage` surprises.

## Install

> This is a **local DSH bundle**, not an npm package. It is installed by linking
> the cloned directory into a DSH profile and adding it to that profile's bundle
> list. Node.js 20+ and pnpm are required for the runtime dependency.

1. Clone the repository somewhere stable:

   ```bash
   git clone https://github.com/SolvasHQ/dsh-theme.git
   cd dsh-theme
   ```

2. Install the plugin's runtime dependency (a schema library shared with DSH):

   ```bash
   pnpm install --prod
   ```

3. Register the bundle in your DSH profile. The recommended way is to ask your
   DSH agent to install the bundle from this directory (Plugin Manager's bundle
   installation with the absolute path). Manual wiring is also possible — in
   `<profile>/package.json`:

   ```json
   {
     "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@local/dsh-personalization"] } },
     "dependencies": { "@local/dsh-personalization": "link:/absolute/path/to/dsh-personalization" }
   }
   ```

   then run `pnpm install` inside the profile directory and restart DSH.

4. Open the Web GUI: the palette icon appears at the bottom-left of the sidebar,
   and **Settings → 个性化 / Personalization** shows the same page.

After that, client-side changes to `client.js` are hot-swapped by DSH's client
HMR transport within about a second; Host-side changes need a DSH restart.

## How it works

- **Theme layer** — the client half registers a single
  `ctx.theme.overrideTokens('@local/dsh-personalization', tokens)` layer. Every
  token is a `{ light, dark }` pair, so the layer composes over whichever
  built-in palette is active and survives OS scheme flips without touching the
  theme registry.
- **Token generation** — 14 anchor colors per palette/mode are expanded into the
  ~97 `--dsw-alias-*` / `--dsw-specific-*` semantic tokens (surfaces, borders,
  labels, buttons, states, markdown/code, diff views, scrollbars, toasts,
  sidebar) with contrast guards.
- **DIY palettes** — derived at runtime from the picked backgrounds, borders,
  text colors, and per-mode accents, so a background change keeps a mode
  coherent until the user pins a specific slot.
- **Fonts** — `--dsh-font-family-text` / `--dsh-font-family-code` ride in the
  same token layer. The Latin and Chinese stacks are composed together; the
  unselected side falls back to the harness's built-in stack.
- **Text size** — uses the theme service's own persisted `setFontSize('text', px)`.
- **Persistence** — the host half declares one `.volatile()` string field on the
  plugin entry; the client reads/writes it through `ctx.configForms`. DSH
  persists that value in the active profile's patch, keyed by the authenticated
  browser identity. Light/dark preference and text size stay with the native
  theme settings.

## Development

```bash
# rebuild client.js after editing src/client.template.js or research/palettes.json
node build/build-client.mjs
node --check client.js

# static checks (manifest, locales, icon, generated artifact)
node tools/check-manifest.mjs

# token/contrast verification for every palette and DIY cases
node tools/verify-tokens.mjs

# functional smoke test of the panel components (render → click → assertions, zh + en)
node tools/check-panel.mjs
```

The browser module loader cannot import local files, so
`build/build-client.mjs` inlines `research/palettes.json` into `client.js`.
`client.js` is a committed build artifact; CI rebuilds it and fails if the
committed file is stale.

## Project layout

```
client.js                 built browser module (committed artifact)
index.js                  host half: volatile settings field
cordis.patch.yml          bundle patch inserting the plugin row
locale/                   plugin metadata for en / zh
src/client.template.js    client source template
build/build-client.mjs    build script (palettes → client.js)
research/                 palette anchors, design notes, palette sheet
tools/                    manifest, token, and panel verification scripts
```

## Compatibility

Tested against DeepSeek Harness desktop `0.2.1-rc.2` (Web GUI). The plugin uses
the documented client seams (`slots`, `theme`, `locale`, `configForms`) and
host-side volatile config; it does not patch the harness or read other plugins'
DOM.

## License

MIT — see [LICENSE](LICENSE).

中文文档：[README.zh.md](README.zh.md) ·
[Changelog](CHANGELOG.md) ·
[Issues](https://github.com/SolvasHQ/dsh-theme/issues)
