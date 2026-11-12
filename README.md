# DSH Theme

**English** | [简体中文](README.zh.md)

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Den)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

Theme palettes, a full DIY color editor, a named custom-theme library, local fonts,
and interface text size for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
Web GUI — switchable from a palette icon at the bottom-left of the sidebar.

Dark and light are first class: every preset and every DIY color carries a value
for both modes, so it keeps working when the native appearance switches between
light, dark, and system.

> **Development build.** The screenshots and feature list below follow the current
> `main` branch. The latest published npm/Discover build is `1.4.0`; the next
> release will ship these additions.

## Screenshots

The English UI is shown here; this README also covers the other non-Chinese UI
languages. The [Chinese README](README.zh.md) uses Chinese captures.

| Main panel | Custom theme editor |
|:---:|:---:|
| <img src="docs/screenshots/panel-en.png" width="310" alt="English personalization panel with 14 presets"> | <img src="docs/screenshots/panel-en-custom.png" width="310" alt="English custom theme editor with base swatches and color fields"> |

**Settings → Theme**

<img src="docs/screenshots/settings-en.png" width="560" alt="Theme settings page in the English UI">

**Entry point:** the palette icon at the **bottom-left of the sidebar**, in the
action row directly above the Settings button. The same page is available under
**Settings → Theme**.

## Features

- **Bottom-left trigger** — a palette icon in the sidebar foot (row above
  Settings). One click opens a compact popover anchored bottom-left.
- **Theme settings page** — the same content as a dedicated **Theme** page, with
  the palette glyph in the Settings navigation.
- **14 presets** — Default (stock harness), Warm, Mono, Claude, Claude+, Vermillion,
  Amber Mono, MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox, Tokyo
  Night**, plus a **Custom** card.
- **DIY theme editor** — per light/dark mode: background, card, popover, sidebar,
  text, border, and that mode's accent color; per-mode error/success/warning
  colors; and a **Bold borders** switch. Slots not edited derive from the
  background/text automatically.
- **Faithful preset bases** — starting from a preset copies all 14 anchors for
  both modes, including the preset's bold-border trait (for example MX Brutalist).
- **Named custom themes** — save the current theme under a name, switch between
  saved themes from **My themes** below the preset grid, mark the active one, and
  multi-select/delete/export them in **Manage** mode.
- **JSON import/export** — export one theme or a pack to a `.json` file; import by
  pasting JSON or choosing a file. The dialog includes a commented example, and
  imported themes appear in **My themes** with the name from the JSON.
- **Fonts** — independent Latin and Chinese stacks plus a code font, applied to
  interface, conversation, and code text. Each role lists the shipped presets plus
  **fonts read from this machine** (marked `Local ·`); local fonts can be hidden
  with a checkbox, **Detect local fonts** refreshes them, and duplicates with a
  preset are allowed.
- **Text size** — 10–22 px through the native theme service, so it survives
  reloads and shares the Ctrl/Cmd `+`/`-` shortcuts.
- **Eight languages** — the panel follows the app language: English, Simplified
  Chinese, Japanese, Spanish, French, German, Russian, and Brazilian Portuguese.
- **Restart-safe persistence** — choices are stored in DSH's Host settings
  document, so they survive app restarts and profile changes of the localhost
  port. No `localStorage` surprises.

## Palette reference

All fourteen presets, with their light and dark token swatches:

![Palette reference sheet](research/preview.png)

## Install

### Discover — recommended

1. Open **Plugins → Discover**.
2. Add this index source:

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.4.0/market/index.json
   ```

   The index is version-pinned so it is available immediately. Replace the tag
   with `@main` for the moving branch — jsDelivr may cache it for up to 12 hours.

3. Find **DSH Theme**, open its page, and press **Install**.

Discover installs the pinned Git commit of that release. The same release is
published to npm as `@solvashq/dsh-theme@1.4.0`, and a prebuilt `dsh-theme.tgz`
is attached to the latest GitHub Release.

### npm

The bundle is published as [`@solvashq/dsh-theme`](https://www.npmjs.com/package/@solvashq/dsh-theme):

```bash
npm install @solvashq/dsh-theme
```

Or let your DSH agent install the bundle from npm with the spec
`@solvashq/dsh-theme@1.4.0`.

### From source (development)

> This is a **local DSH bundle**. It is installed by linking the cloned directory
> into a DSH profile and adding it to that profile's bundle list. Node.js 20+ and
> pnpm are required.

1. Clone the repository somewhere stable:

   ```bash
   git clone https://github.com/SolvasHQ/dsh-theme.git
   cd dsh-theme
   ```

2. Install the plugin's runtime dependencies **inside the plugin directory**.
   DSH loads profile plugins with symlink-preserving resolution, so the schema
   library and its transitive packages must live in the plugin's own
   `node_modules`:

   ```bash
   pnpm install --prod
   ```

3. Register the bundle in your DSH profile. The recommended way is to ask your
   DSH agent to install the bundle from this directory (Plugin Manager's bundle
   installation with the absolute path). Manual wiring is also possible — in
   `<profile>/package.json`:

   ```json
   {
     "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@solvashq/dsh-theme"] } },
     "dependencies": { "@solvashq/dsh-theme": "link:/absolute/path/to/dsh-theme" }
   }
   ```

   then run `pnpm install` inside the profile directory and restart DSH.

4. Open the Web GUI: the palette icon appears at the bottom-left of the sidebar,
   and **Settings → Theme** shows the same page.

After that, client-side changes to `client.js` are hot-swapped by DSH's client
HMR transport within about a second; Host-side changes need a DSH restart.

## How it works

- **Theme layer** — the client registers a single
  `ctx.theme.overrideTokens('@solvashq/dsh-theme', tokens)` layer. Every token is a
  `{ light, dark }` pair, so it composes over whichever built-in palette is active
  and survives OS scheme flips without touching the theme registry.
- **Token generation** — 14 anchor colors per palette/mode expand into the ~97
  `--dsw-alias-*` / `--dsw-specific-*` semantic tokens (surfaces, borders, labels,
  buttons, states, markdown/code, diff views, scrollbars, toasts, sidebar) with
  contrast guards.
- **DIY palettes** — derived at runtime from the picked backgrounds, borders,
  text colors, and per-mode accents. Preset bases preserve every anchor, so
  unedited slots keep the original preset's light/dark relationship.
- **Custom themes** — stored in the Host settings document as part of the
  `preferences` field, alongside fonts and the active palette.
- **Fonts** — `--dsh-font-family-text` / `--dsh-font-family-code` ride in the same
  token layer. Built-in presets and local families share one menu, with the Latin
  and Chinese stacks composed together and a generic fallback.
- **Languages** — one typed client dictionary per shipped DSH locale (`zh`, `en`,
  `ja`, `es`, `fr`, `de`, `ru`, `pt`); theme and font brand names are preserved.
- **Text size** — uses the theme service's own persisted `setFontSize('text', px)`.
- **Persistence** — the host half declares one `.volatile()` string field; the
  client reads/writes it through `ctx.configForms`, and DSH stores it in the
  active profile's patch.

## Development

```bash
# rebuild client.js after editing src/client.template.js or research/palettes.json
node build/build-client.mjs
node --check client.js

# static checks (manifest, locales, icon, generated artifact)
node tools/check-manifest.mjs

# Discover market index validation
node tools/check-market.mjs

# token/contrast verification for every palette and DIY case
node tools/verify-tokens.mjs

# functional smoke test of the panel components (render → click → assertions)
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
locale/                   plugin metadata for all eight DSH languages
src/client.template.js    client source template
build/build-client.mjs    build script (palettes → client.js)
market/index.json         Discover market index (format 1)
docs/screenshots/         README screenshots (Chinese and English UI)
research/                 palette anchors, design notes, palette sheet
tools/                    manifest, market, token, and panel checks
```

## Compatibility

Tested against DeepSeek Harness desktop `0.2.2-rc.1` (Web GUI); the 0.2.1-rc.2
line still works. The plugin uses the documented client seams (`slots`, `theme`,
`locale`, `configForms`) and host-side volatile config; it does not patch the
harness or read other plugins' DOM.

## Palette credits

Catppuccin, Nord, Gruvbox, and Tokyo Night are community palettes by their
respective authors. They are used here as colour references, mapped onto DSH's
14 anchors with contrast adjustments; the links are listed in
`research/palettes.json` under `sources`, and each project's licence applies.

## License

MIT — see [LICENSE](LICENSE).

[Changelog](CHANGELOG.md) · [Issues](https://github.com/SolvasHQ/dsh-theme/issues)
