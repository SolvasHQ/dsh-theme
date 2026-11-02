# Changelog

All notable changes to this plugin are documented here.

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
