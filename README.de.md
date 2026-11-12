# DSH-Theme

[简体中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Français](README.fr.md) | **Deutsch** | [Русский](README.ru.md) | [Português](README.pt.md)

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Den)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

Themenfarben, ein vollständiger DIY-Farbeditor, eine Bibliothek benannter eigener
Themes, lokale Schriften und Textgröße für die Web-GUI von
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Erreichbar über
das Palettensymbol unten links in der Seitenleiste.

Hell und dunkel sind gleichwertig: Jede Voreinstellung und jede DIY-Farbe besitzt
Werte für beide Modi und funktioniert daher auch beim Wechsel zwischen Hell, Dunkel
und System.

## Screenshots

Hier ist die englische Oberfläche zu sehen; das chinesische README verwendet
chinesische Aufnahmen. Die übrigen Sprachen nutzen dasselbe Layout.

| Hauptpanel | Editor für eigene Themes |
|:---:|:---:|
| <img src="docs/screenshots/panel-en.png" width="310" alt="Englisches Panel mit 14 Voreinstellungen"> | <img src="docs/screenshots/panel-en-custom.png" width="310" alt="Englischer Editor mit Basis-Swatches und Farbfeldern"> |

**Einstellungen → Theme**

<img src="docs/screenshots/settings-en.png" width="560" alt="Theme-Seite in der englischen Oberfläche">

**Einstieg**: das Palettensymbol **unten links in der Seitenleiste**, in der Zeile
über „Einstellungen“. Dieselbe Seite liegt unter **Einstellungen → Theme**.

## Funktionen

- **14 Voreinstellungen**: Standard, Warm, Mono, Claude, Claude+, Vermillion, Amber
  Mono, MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox und Tokyo Night**
  sowie eine **Benutzerdefiniert**-Karte.
- **DIY-Editor**: pro Hell-/Dunkelmodus Hintergrund, Karte, Overlay, Seitenleiste,
  Text, Rahmen und Akzent des Modus; Statusfarben werden pro Modus gespeichert;
  Schalter **Kräftige Rahmen**. Nicht bearbeitete Felder werden abgeleitet.
- **Originalgetreue Preset-Basen**: Beim Start von einem Preset werden alle 14
  Anker beider Modi übernommen, inklusive der Rahmen-Eigenschaft (z. B. MX
  Brutalist).
- **Benannte eigene Themes**: Mit Namen speichern, unter **Meine Themes** wechseln
  (aktives Theme mit ✓), im **Verwalten**-Modus mehrere auswählen, löschen oder
  exportieren.
- **JSON-Import/Export**: Ein Theme oder ein Paket als `.json` exportieren; per
  Einfügen oder Dateiauswahl importieren. Der Dialog enthält ein kommentiertes
  Beispiel; importierte Themes erscheinen mit dem `name` aus der JSON-Datei unter
  **Meine Themes**.
- **Schriften**: getrennte Stapel für Latein, Chinesisch und Code. Jedes Menü listet
  Voreinstellungen und **lokal gelesene Schriften** (`Lokal ·`), mit Ausblenden und
  **Lokale Schriften erkennen**; Doppelungen sind erlaubt.
- **Textgröße**: 10–22 px über den nativen Theme-Dienst, bleibt nach dem Neuladen
  erhalten.
- **Acht Sprachen**: Vereinfachtes Chinesisch, Englisch, Japanisch, Spanisch,
  Französisch, Deutsch, Russisch und brasilianisches Portugiesisch.
- **Neustartfest**: Die Auswahl liegt im Host-Einstellungsdokument von DSH.

## Palettenreferenz

![Palettenreferenz](research/preview.png)

## Installation

### Discover (empfohlen)

1. **Plugins → Discover** öffnen.
2. Diese Indexquelle hinzufügen:

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.5.0/market/index.json
   ```

3. **DSH Theme** suchen, öffnen und **Install** drücken.

Der Index ist auf den Git-Commit von 1.5.0 festgelegt. Dieselbe Version erscheint auf
npm als `@solvashq/dsh-theme@1.5.0`; das GitHub-Release enthält außerdem
`dsh-theme.tgz`.

### npm

```bash
npm install @solvashq/dsh-theme
```

Alternativ kann der DSH-Agent `@solvashq/dsh-theme@1.5.0` installieren.

### Aus dem Quellcode

```bash
git clone https://github.com/SolvasHQ/dsh-theme.git
cd dsh-theme
pnpm install --prod
```

Das Verzeichnis in die Bundle-Liste des DSH-Profils eintragen (am besten über den
Plugin Manager mit absolutem Pfad), im Profil `pnpm install` ausführen und DSH
neu starten.

## Kompatibilität

Getestet mit DeepSeek Harness Desktop `0.2.2-rc.1` (Web-GUI); die 0.2.1-rc.2-Linie
funktioniert weiterhin. Das Plugin nutzt nur öffentliche Client-Schnittstellen
(`slots`, `theme`, `locale`, `configForms`) und die volatile Host-Konfiguration.

## Paletten-Credits

Catppuccin, Nord, Gruvbox und Tokyo Night sind Community-Paletten ihrer jeweiligen
Autoren. Sie dienen als Farbreferenzen und wurden mit Kontrastanpassungen auf die
14 Anker von DSH abgebildet; die Links stehen in `research/palettes.json` unter
`sources`, es gilt die Lizenz des jeweiligen Projekts.

## Lizenz

MIT — siehe [LICENSE](LICENSE).

[Changelog](CHANGELOG.md) · [Issues](https://github.com/SolvasHQ/dsh-theme/issues)
