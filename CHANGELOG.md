# Changelog

All notable changes to this plugin are documented here.

## 1.4.0

- Publishable identity: renamed the package to the public scope
  `@solvashq/dsh-theme` (from `@local/dsh-theme`) and dropped `private`, so the
  same code can be published to npm or installed from a prebuilt GitHub Release
  tarball. The bundle row and settings namespace stay `dsh-theme`, so existing
  preferences are preserved.
- Added square raster icons (`assets/icon-180.png`, `assets/icon-512.png`) for
  storefront and market cards that prefer raster artwork over SVG.
- Added a prebuilt `dsh-theme.tgz` release asset; the Discover index now pins
  version 1.4.0 to this release's Git commit.
- No functional changes: palettes, DIY editor, fonts, text size, and appearance
  control behave exactly as in 1.3.0.

## 1.3.0

- Renamed the project to **DSH Theme** so one name covers the repository, the
  local package (`@local/dsh-theme`), the client module id, plugin metadata, and
  the bundle row/settings namespace (`dsh-theme`). Existing preferences are
  migrated on upgrade, so the active theme, DIY colors, and fonts are kept.
- No functional changes: palettes, DIY editor, fonts, text size, and appearance
  control behave exactly as in 1.2.0.

## 1.2.0

- Durable preferences: the host half now declares a volatile `preferences`
  settings field and the client reads/writes it through `ctx.configForms`, so
  theme, DIY colors, and fonts survive app restarts (the desktop Web GUI changes
  its localhost port on every launch, so `localStorage` could not be the durable
  store). `localStorage` remains a per-session cache and migration source.
- The plugin's runtime dependency is declared explicitly (`@deepseek-ai/schemastery`).

## 1.1.0

- Light/dark/system segmented control inside the panel, wired to the native
  appearance preference.
- Bilingual UI following the app language (Simplified Chinese / English).
- DIY theme editor: per-mode background, card, popover, sidebar, text, border,
  and accent colors; shared error/success/warning colors; bold-border switch.
- Compact, scroll-free layout: reset moved to the header, footer row removed.
- Font dropdowns open upward and the code-font select matches the Latin row.

## 1.0.0

- Bottom-left palette trigger (`sidebar.footer.action`) and a `settings.section`
  personalization page.
- 10 theme presets with light and dark values, built on a single
  `ctx.theme.overrideTokens` alias-token layer (97 semantic tokens).
- Latin / Chinese / code font selection and interface text size (10–22 px).
