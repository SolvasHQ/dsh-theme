# DSH Theme

[简体中文](README.zh.md) | **English** | [日本語](README.ja.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Русский](README.ru.md) | [Português](README.pt.md)

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

## Screenshots

The English UI is shown here; this README also serves the other non-Chinese UI
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

- **14 presets** — Default, Warm, Mono, Claude, Claude+, Vermillion, Amber Mono,
  MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox, Tokyo Night**, plus
  a **Custom** card.
- **DIY theme editor** — per light/dark mode: background, card, popover, sidebar,
  text, border, and that mode's accent; per-mode error/success/warning colors; a
  **Bold borders** switch. Unedited slots derive automatically.
- **Faithful preset bases** — starting from a preset copies all 14 anchors for
  both modes, including the preset's bold-border trait (for example MX Brutalist).
- **Named custom themes** — save under a name, switch in **My themes** with the
  active one checked, and multi-select/delete/export in **Manage** mode.
- **JSON import/export** — export one theme or a pack to `.json`; import by pasting
  JSON or choosing a file. The dialog includes a commented example, and imported
  themes appear in **My themes** using the JSON `name`.
- **Fonts** — independent Latin and Chinese stacks plus a code font. Each menu
  lists built-in presets and **fonts read from this machine** (`Local ·`), with a
  hide toggle and **Detect local fonts**; duplicates with presets are allowed.
- **Text size** — 10–22 px through the native theme service, shared with the
  Ctrl/Cmd `+`/`-` shortcuts.
- **Eight languages** — English, Simplified Chinese, Japanese, Spanish, French,
  German, Russian, and Brazilian Portuguese.
- **Restart-safe persistence** — choices live in the Host settings document.

## Palette reference

![Palette reference sheet](research/preview.png)

## Install

### Discover — recommended

1. Open **Plugins → Discover**.
2. Add this index source:

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@be05cdd37d6123bea5ba50435217476d0c97f516/market/index.json
   ```

3. Find **DSH Theme**, open its page, and press **Install**.

The index is pinned to the 1.5.0 Git commit. The same release is published to npm
as `@solvashq/dsh-theme@1.5.0`, and a prebuilt `dsh-theme.tgz` is attached to the
GitHub Release.

### npm

```bash
npm install @solvashq/dsh-theme
```

Or install the spec `@solvashq/dsh-theme@1.5.0` through your DSH agent.

### From source

```bash
git clone https://github.com/SolvasHQ/dsh-theme.git
cd dsh-theme
pnpm install --prod
```

Link the directory into your DSH profile's bundle list (preferably through Plugin
Manager with the absolute path), run `pnpm install` in the profile, and restart
DSH.

## Compatibility

Tested against DeepSeek Harness desktop `0.2.2-rc.1` (Web GUI); the 0.2.1-rc.2
line still works. The plugin uses the documented client seams (`slots`, `theme`,
`locale`, `configForms`) and host-side volatile config.

## Palette credits

Catppuccin, Nord, Gruvbox, and Tokyo Night are community palettes by their
respective authors. They are used as colour references, mapped onto DSH's 14
anchors with contrast adjustments; links are in `research/palettes.json` under
`sources`, and each project's licence applies.

## License

MIT — see [LICENSE](LICENSE).

[Changelog](CHANGELOG.md) · [Issues](https://github.com/SolvasHQ/dsh-theme/issues)
