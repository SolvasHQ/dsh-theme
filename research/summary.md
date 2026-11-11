# DSH Theme Palettes — Research Summary

Design research for a theme-personalization panel in the DeepSeek Harness desktop web UI.
**No plugin code is included here** — only color and font research.

- `palettes.json` — machine-readable: 13 themes × 14 tokens × (light + dark), 6 font stacks, 5 size steps, sources.
- `summary.md` — this human-readable digest (all contrast ratios computed from the JSON).

## Themes at a glance

| id | Name | 中文 | Vibe | Text/bg (light) | Text/bg (dark) | Accent (light) | Accent (dark) |
|---|---|---|---|---|---|---|---|
| `default` | Default | 默认 | Warm off-white paper, near-black ink, muted forest-green accent. The stock DSH feel, warmed up. | **16.6:1** | **16.0:1** | `#2F6B50` | `#3F8560` |
| `mono` | Mono | 单色 | Strict grayscale — Vercel/shadcn minimalism, zero hue in the neutrals. | **19.2:1** | **19.0:1** | `#171717` | `#EDEDED` |
| `claude` | Claude | 克劳德 | Anthropic cream and clay: bone surfaces, warm brown ink, soft terracotta accent. | **11.6:1** | **14.0:1** | `#BB5A38` | `#BF6035` |
| `claude-plus` | Claude+ | 克劳德+ | Claude turned up — deeper parchment, espresso text, burnt-sienna accent. | **14.3:1** | **16.9:1** | `#A33F1F` | `#C5512B` |
| `vermillion` | Vermillion | 朱红 | Cinnabar seal-ink red on warm paper with a soot-dark night mode. | **16.0:1** | **15.8:1** | `#C63D22` | `#D2492D` |
| `amber-mono` | Amber Mono | 琥珀单色 | Near-monochrome warm gray with a single amber accent, like lamplight on paper. | **16.1:1** | **15.5:1** | `#A16800` | `#A06B00` |
| `mx-brutalist` | MX Brutalist | 粗暴极简 | Pure white / pure black, hard ink borders, electric-blue accent. No softness. | **21.0:1** | **21.0:1** | `#1732E0` | `#3A5BFF` |
| `tiesen` | Tiesen | 墨青 | Quiet, cool, desaturated blue-teal ink on pale mist — calm for long reading. | **15.0:1** | **15.7:1** | `#2E6B6E` | `#3E8B86` |
| `vescrow` | Vescrow | 暗紫 | Deep indigo night: violet-tinted near-black, navy primary, faint lilac stage. | **18.3:1** | **18.3:1** | `#1F2A6E` | `#4C5BD9` |
| `catppuccin` | Catppuccin | Catppuccin | Soft pastel Latte/Mocha surfaces, cool blue accent, gentle contrast. | **11.0:1** | **11.3:1** | `#1E66F5` | `#89B4FA` |
| `nord` | Nord | Nord | Arctic blue-gray light, Polar Night dark, snow borders, frost-blue accent. | **10.8:1** | **10.8:1** | `#5E81AC` | `#88C0D0` |
| `gruvbox` | Gruvbox | Gruvbox | Warm cream-paper light and charcoal dark, orange accent, olive/amber states. | **10.2:1** | **10.8:1** | `#AF3A03` | `#FABD2F` |
| `tokyo-night` | Tokyo Night | Tokyo Night | Cool blue-violet city glow, deep navy backgrounds, bright blue accent. | **10.7:1** | **10.6:1** | `#2E7DE9` | `#7AA2F7` |

## Theme details

### Default · 默认 (`default`)

> Warm paper white with near-black ink and a quiet forest-green accent — the familiar DSH layout, warmed up.

**Light** — base `#F8F7F4` · layer1 `#FFFFFF` · layer2 `#F2F0EA` · overlay `#FFFDF8` · sidebar `#F1EFE9` · accent `#2F6B50` · text `#191814` / `#5F5A51` · error `#C0362C` · success `#2E7D4F` · warn `#966300` · idle `#948E82`

Ratios: text/bg **16.6:1**, secondary/bg **6.4:1**, accent/bg **5.9:1**, white/accent **6.3:1**, error/bg **5.2:1**, success/bg **4.7:1**, warn/bg **4.8:1**, idle/bg **3.0:1**; borders vs base **1.18 / 1.43**; sidebar vs base **1.07:1**.

**Dark** — base `#141413` · layer1 `#1D1C1A` · layer2 `#262421` · overlay `#2C2A26` · sidebar `#101010` · accent `#3F8560` · text `#F1EFE9` / `#ABA599` · error `#E5675C` · success `#5DB583` · warn `#D9A441` · idle `#726C61`

Ratios: text/bg **16.0:1**, secondary/bg **7.5:1**, accent/bg **4.2:1**, white/accent **4.4:1**, error/bg **5.6:1**, success/bg **7.4:1**, warn/bg **8.2:1**, idle/bg **3.5:1**; borders vs base **1.36 / 1.76**; sidebar vs base **1.03:1**.

### Mono · 单色 (`mono`)

> Strict grayscale in the Vercel/shadcn tradition: black on white, white on black, zero hue in the neutrals.

**Light** — base `#FFFFFF` · layer1 `#FFFFFF` · layer2 `#F4F4F4` · overlay `#FFFFFF` · sidebar `#F6F6F6` · accent `#171717` · text `#0F0F0F` / `#5F5F5F` · error `#C62828` · success `#1E7B3C` · warn `#8F6400` · idle `#999999`

Ratios: text/bg **19.2:1**, secondary/bg **6.4:1**, accent/bg **17.9:1**, white/accent **17.9:1**, error/bg **5.6:1**, success/bg **5.3:1**, warn/bg **5.3:1**, idle/bg **2.8:1**; borders vs base **1.25 / 1.51**; sidebar vs base **1.08:1**.

**Dark** — base `#0A0A0A` · layer1 `#141414` · layer2 `#1D1D1D` · overlay `#242424` · sidebar `#111111` · accent `#EDEDED` · text `#FAFAFA` / `#A6A6A6` · error `#F26D6D` · success `#46B96B` · warn `#CFA33F` · idle `#6B6B6B`

Ratios: text/bg **19.0:1**, secondary/bg **8.1:1**, accent/bg **16.9:1**, white/accent **1.2:1**, error/bg **6.8:1**, success/bg **7.9:1**, warn/bg **8.5:1**, idle/bg **3.7:1**; borders vs base **1.38 / 1.94**; sidebar vs base **1.05:1**.

### Claude · 克劳德 (`claude`)

> Anthropic's warm cream and clay: bone-white surfaces, warm brown ink and a soft terracotta accent.

**Light** — base `#FAF8F1` · layer1 `#FEFDF9` · layer2 `#F2EFE5` · overlay `#FFFEFA` · sidebar `#F4F1E7` · accent `#BB5A38` · text `#3A3428` / `#6E6759` · error `#B23A2C` · success `#3F7A51` · warn `#9A6407` · idle `#97907F`

Ratios: text/bg **11.6:1**, secondary/bg **5.3:1**, accent/bg **4.3:1**, white/accent **4.5:1**, error/bg **5.6:1**, success/bg **4.8:1**, warn/bg **4.7:1**, idle/bg **3.0:1**; borders vs base **1.23 / 1.51**; sidebar vs base **1.06:1**.

**Dark** — base `#1F1E1B` · layer1 `#272622` · layer2 `#302E28` · overlay `#35332C` · sidebar `#1A1917` · accent `#BF6035` · text `#F1EBDF` / `#B6AD9F` · error `#E8786A` · success `#6FB284` · warn `#D9A54B` · idle `#8B8477`

Ratios: text/bg **14.0:1**, secondary/bg **7.5:1**, accent/bg **3.9:1**, white/accent **4.3:1**, error/bg **5.8:1**, success/bg **6.6:1**, warn/bg **7.5:1**, idle/bg **4.5:1**; borders vs base **1.43 / 1.89**; sidebar vs base **1.05:1**.

### Claude+ · 克劳德+ (`claude-plus`)

> Claude turned up: deeper parchment background, darker espresso text and a burnt-sienna accent with more punch.

**Light** — base `#F2EEE3` · layer1 `#FBF8F0` · layer2 `#E9E4D6` · overlay `#FFFCF5` · sidebar `#ECE7DA` · accent `#A33F1F` · text `#211E17` / `#5B5447` · error `#9E2F22` · success `#2F6B43` · warn `#8A5A00` · idle `#8C8574`

Ratios: text/bg **14.3:1**, secondary/bg **6.5:1**, accent/bg **5.5:1**, white/accent **6.4:1**, error/bg **6.3:1**, success/bg **5.5:1**, warn/bg **5.1:1**, idle/bg **3.2:1**; borders vs base **1.26 / 1.59**; sidebar vs base **1.06:1**.

**Dark** — base `#161513` · layer1 `#1F1E1A` · layer2 `#292722` · overlay `#2C2924` · sidebar `#111110` · accent `#C5512B` · text `#FBF6EC` / `#B9B1A2` · error `#EC7565` · success `#64AC7C` · warn `#D8A344` · idle `#8A8376`

Ratios: text/bg **16.9:1**, secondary/bg **8.6:1**, accent/bg **4.0:1**, white/accent **4.6:1**, error/bg **6.3:1**, success/bg **6.7:1**, warn/bg **8.0:1**, idle/bg **4.9:1**; borders vs base **1.43 / 1.85**; sidebar vs base **1.04:1**.

### Vermillion · 朱红 (`vermillion`)

> Cinnabar seal-ink red on warm paper, with a soot-dark night mode — East-Asian stationery energy.

**Light** — base `#FAF7F3` · layer1 `#FFFDF9` · layer2 `#F3EEE7` · overlay `#FFFFFF` · sidebar `#F4F0E9` · accent `#C63D22` · text `#1E1B18` / `#635C52` · error `#B32F24` · success `#37754A` · warn `#9A6203` · idle `#9C9488`

Ratios: text/bg **16.0:1**, secondary/bg **6.2:1**, accent/bg **4.8:1**, white/accent **5.1:1**, error/bg **5.9:1**, success/bg **5.2:1**, warn/bg **4.8:1**, idle/bg **2.8:1**; borders vs base **1.23 / 1.50**; sidebar vs base **1.06:1**.

**Dark** — base `#171412` · layer1 `#201C19` · layer2 `#292420` · overlay `#302A25` · sidebar `#120F0D` · accent `#D2492D` · text `#F4EDE6` / `#B4A99B` · error `#EF6C5C` · success `#62AE7F` · warn `#D7A03F` · idle `#8A8175`

Ratios: text/bg **15.8:1**, secondary/bg **7.9:1**, accent/bg **4.1:1**, white/accent **4.4:1**, error/bg **6.1:1**, success/bg **6.9:1**, warn/bg **7.8:1**, idle/bg **4.8:1**; borders vs base **1.41 / 1.81**; sidebar vs base **1.04:1**.

### Amber Mono · 琥珀单色 (`amber-mono`)

> Near-monochrome warm gray with one amber accent — a paper-and-lamp-light minimal look.

**Light** — base `#FAF9F6` · layer1 `#FFFFFF` · layer2 `#F3F1EC` · overlay `#FFFEFB` · sidebar `#F2EFE8` · accent `#A16800` · text `#1F1C16` / `#645D50` · error `#B03A2E` · success `#4A7A46` · warn `#8A6100` · idle `#9A9284`

Ratios: text/bg **16.1:1**, secondary/bg **6.2:1**, accent/bg **4.4:1**, white/accent **4.7:1**, error/bg **5.7:1**, success/bg **4.8:1**, warn/bg **5.3:1**, idle/bg **2.9:1**; borders vs base **1.23 / 1.50**; sidebar vs base **1.09:1**.

**Dark** — base `#191713` · layer1 `#221F1A` · layer2 `#2B2721` · overlay `#322D26` · sidebar `#131110` · accent `#A06B00` · text `#F3EEE4` / `#B8AE9D` · error `#E97463` · success `#63AE7B` · warn `#D9A63C` · idle `#8C8476`

Ratios: text/bg **15.5:1**, secondary/bg **8.2:1**, accent/bg **3.9:1**, white/accent **4.6:1**, error/bg **6.1:1**, success/bg **6.7:1**, warn/bg **8.1:1**, idle/bg **4.8:1**; borders vs base **1.39 / 1.80**; sidebar vs base **1.05:1**.

### MX Brutalist · 粗暴极简 (`mx-brutalist`)

> Pure white, pure black, hard 1px ink borders and a saturated electric-blue accent — zero softness, high impact.

**Light** — base `#FFFFFF` · layer1 `#FFFFFF` · layer2 `#F2F2F2` · overlay `#FFFFFF` · sidebar `#F7F7F7` · accent `#1732E0` · text `#000000` / `#3A3A3A` · error `#D50000` · success `#00702F` · warn `#7A5A00` · idle `#6E6E6E`

Ratios: text/bg **21.0:1**, secondary/bg **11.4:1**, accent/bg **8.2:1**, white/accent **8.2:1**, error/bg **5.5:1**, success/bg **6.3:1**, warn/bg **6.4:1**, idle/bg **5.1:1**; borders vs base **17.93 / 21.00**; sidebar vs base **1.07:1**.

**Dark** — base `#000000` · layer1 `#0B0B0B` · layer2 `#161616` · overlay `#1D1D1D` · sidebar `#0B0B0B` · accent `#3A5BFF` · text `#FFFFFF` / `#AFAFAF` · error `#FF3B30` · success `#2BD964` · warn `#FFD60A` · idle `#8A8A8A`

Ratios: text/bg **21.0:1**, secondary/bg **9.6:1**, accent/bg **4.1:1**, white/accent **5.1:1**, error/bg **5.9:1**, success/bg **11.2:1**, warn/bg **14.9:1**, idle/bg **6.1:1**; borders vs base **1.87 / 17.14**; sidebar vs base **1.07:1**.

### Tiesen · 墨青 (`tiesen`)

> Quiet, cool and desaturated: blue-teal ink on a pale mist page, calm enough for long reading sessions.

**Light** — base `#F6F8F9` · layer1 `#FFFFFF` · layer2 `#EDF1F2` · overlay `#FFFFFF` · sidebar `#EEF2F3` · accent `#2E6B6E` · text `#15242A` / `#56676D` · error `#B23F39` · success `#2C7A55` · warn `#94660D` · idle `#849699`

Ratios: text/bg **15.0:1**, secondary/bg **5.5:1**, accent/bg **5.7:1**, white/accent **6.1:1**, error/bg **5.4:1**, success/bg **4.9:1**, warn/bg **4.7:1**, idle/bg **2.9:1**; borders vs base **1.18 / 1.43**; sidebar vs base **1.06:1**.

**Dark** — base `#0F1618` · layer1 `#172023` · layer2 `#1F2A2D` · overlay `#243034` · sidebar `#0B1113` · accent `#3E8B86` · text `#E7EFEF` / `#9DAFB2` · error `#E27C74` · success `#58B98F` · warn `#D5A24A` · idle `#6C7E82`

Ratios: text/bg **15.7:1**, secondary/bg **8.0:1**, accent/bg **4.6:1**, white/accent **4.0:1**, error/bg **6.4:1**, success/bg **7.6:1**, warn/bg **7.9:1**, idle/bg **4.3:1**; borders vs base **1.40 / 1.84**; sidebar vs base **1.04:1**.

### Vescrow · 暗紫 (`vescrow`)

> Deep indigo night: violet-tinted near-black, a navy primary and a faint lilac stage — dark-first and moody.

**Light** — base `#FDFCFE` · layer1 `#FFFFFF` · layer2 `#F3F1F6` · overlay `#FFFFFF` · sidebar `#F4F2F8` · accent `#1F2A6E` · text `#14101C` / `#635D69` · error `#C22B2B` · success `#2F7D5B` · warn `#96680F` · idle `#9A93A0`

Ratios: text/bg **18.3:1**, secondary/bg **6.2:1**, accent/bg **12.7:1**, white/accent **13.0:1**, error/bg **5.6:1**, success/bg **4.9:1**, warn/bg **4.8:1**, idle/bg **2.9:1**; borders vs base **1.26 / 1.53**; sidebar vs base **1.09:1**.

**Dark** — base `#07080F` · layer1 `#0C0F1A` · layer2 `#121627` · overlay `#171B30` · sidebar `#090B16` · accent `#4C5BD9` · text `#F6F4FA` / `#A29EAF` · error `#EC6A61` · success `#58B98A` · warn `#D6A447` · idle `#6A6578`

Ratios: text/bg **18.3:1**, secondary/bg **7.7:1**, accent/bg **3.6:1**, white/accent **5.5:1**, error/bg **6.5:1**, success/bg **8.3:1**, warn/bg **8.8:1**, idle/bg **3.6:1**; borders vs base **1.30 / 1.64**; sidebar vs base **1.02:1**.

## Contrast targets used

| Requirement | Target | Result |
|---|---|---|
| label-primary on bg-base | ≥ 10:1 | min **11.6:1** |
| label-secondary on bg-base | ≥ 4.5:1 | min **5.3:1** |
| label-secondary on every surface | ≥ 4.4:1 | min **4.9:1** |
| brand-primary on bg-base | ≥ 3:1 | min **3.6:1** |
| state colors on bg-base | ≥ 4.4:1 | min **4.7:1** |

White-on-accent ranges **4.5–17.9:1** in light mode and **4.0–5.5:1** in dark (mono excluded — it uses an inverted, near-white button).

## Font presets

| id | Name | 中文 | Latin stack | CJK stack |
|---|---|---|---|---|
| `system` | System | 跟随系统 | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Noto Sans SC', 'Source Han Sans SC', sans-serif` |
| `humanist` | Humanist (Inter) | 人本无衬线 | `'Inter', 'Inter Variable', 'Segoe UI Variable Display', 'Helvetica Neue', Arial, sans-serif` | `'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif` |
| `serif` | Literary Serif | 宋体衬线 | `'Source Serif 4', 'Source Serif Pro', 'Iowan Old Style', Georgia, 'Times New Roman', serif` | `'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', 'SimSun', serif` |
| `rounded` | Soft Rounded | 圆润无衬线 | `ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', 'M PLUS Rounded 1c', 'Nunito', 'Quicksand', system-ui, sans-serif` | `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', sans-serif` |
| `mono` | Monospace | 等宽 | `'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', ui-monospace, Menlo, Consolas, monospace` | `'Sarasa Mono SC', 'Sarasa Term SC', 'Noto Sans Mono CJK SC', 'Noto Sans SC', 'PingFang SC', monospace` |
| `kai` | Literary Kai | 文楷手写 | `'Palatino Linotype', 'Iowan Old Style', 'Book Antiqua', Palatino, Georgia, serif` | `'LXGW WenKai', 'Kaiti SC', 'STKaiti', 'KaiTi', 'Noto Serif SC', serif` |

All stacks degrade gracefully: missing webfonts fall through to the native platform fonts, so no preset can break rendering.

- **System (跟随系统)** — Native system UI fonts on every platform — zero load cost and the most familiar reading rhythm.
- **Humanist (Inter) (人本无衬线)** — Neutral humanist sans with a tall x-height; pairs Inter with Source Han Sans / Noto Sans SC for even CJK-Latin texture.
- **Literary Serif (宋体衬线)** — A book-like serif pairing: Source Serif / Georgia for Latin and Source Han Serif / Noto Serif SC (思源宋体) for Chinese.
- **Soft Rounded (圆润无衬线)** — Rounded terminals and open apertures for a friendly, app-like feel; falls back to PingFang/Noto Sans SC for Chinese.
- **Monospace (等宽)** — Coding-flavoured UI: JetBrains Mono / SF Mono / Cascadia Code paired with Sarasa Mono SC so Chinese glyphs also align to the grid.
- **Literary Kai (文楷手写)** — A calligraphic display pairing for a personal, editorial mood: Palatino for Latin and LXGW WenKai / KaiTi for Chinese.

## Font size scale (host base 16px)

| Percent | px |
|---|---|
| 90% | 14.4px |
| 100% | 16px |
| 110% | 17.6px |
| 120% | 19.2px |
| 130% | 20.8px |

Multiply the host root size by `percent / 100` if the host default is not 16px.

## Design rules applied

- **Anchored to DSH itself.** The live app defines `--dsw-alias-bg-base: #FFFFFF`, `label-primary: #0F1115`, `sidebar: #F9FAFB` in light and `#151517` / `#F9FAFB` / `#1B1B1C` in dark, with `brand-primary` inverting from near-black to near-white. `default` keeps that structure but warms the paper and tints the accent green.
- **Surface ladder.** Light: base (warm/neutral) → layer1 lighter (white card) → layer2 slightly deeper → overlay lightest. Dark: base → layer1 → layer2 → overlay each a step lighter, except where a theme is deliberately flat (`mono`, `mx-brutalist`).
- **Borders** sit at ~1.18–1.26:1 against the base in light mode and ~1.32–1.43:1 in dark (dark needs more), with border-l2 clearly stronger than border-l1. `mx-brutalist` intentionally uses near-black hard rules.
- **Sidebar** stays within 1.01–1.09:1 of the base so it reads as the same room, one shade apart.
- **Dark mode is never `#000`** except `mx-brutalist`; the darkest base is `vescrow` at `#07080F`.
- **State colors** are shared-hue across modes (red stays red, green stays green) but re-lit per mode so they stay readable on both surfaces.

## Known exceptions (intentional)

- **mono (dark)** — `brandPrimary` is near-white `#EDEDED`, matching Vercel/shadcn inverted buttons. Use a near-black label on it (≈17:1); white-on-accent is impossible for a mono dark button. This is the one deliberate break from the "white label on accent" rule.
- **mx-brutalist** — borders are hard ink rules by design (17–21:1), and dark mode uses true `#000000`.
- **claude dark** — accent sits at `#BF6035` rather than the raw brand `#D97757`, because `#D97757` only reaches 3.1:1 against white; the darker clay keeps button text legible (4.5:1) while staying recognisably Anthropic.
- **bg-overlay** is modelled as a *popover surface* (as the token description says), not as a scrim/mask color.

## Sources

- https://www.shadcnblocks.com/r/theme/claude.json — Claude theme (tweakcn) light/dark OKLCH seed values for the claude palette
- https://www.shadcnblocks.com/r/theme/vermillion.json — Vermillion theme (tweakcn) cinnabar primary + neutral ramp
- https://www.shadcnblocks.com/r/theme/vescrow.json — Vescrow theme (tweakcn) indigo/navy ramp and dark surfaces
- https://www.shadcnblocks.com/r/theme/amber-minimal.json — Amber Minimal theme (tweakcn) amber accent reference for amber-mono
- https://www.shadcnblocks.com/r/theme/default.json — shadcn default theme (neutral ramp, destructive red) for mono
- https://www.shadcnblocks.com/theme/vescrow — Vescrow description: deep-indigo, faintly violet white stage, navy primary
- https://tweakcn.com/themes/cmie97f2b000704l27r9g1p11 — Tiesen (tweakcn) referenced by the Tiesen brand page
- https://tiesen.id.vn/blogs/brand — Tiesen brand guidelines (cool ink identity, palette link)
- https://docs.rikka-ai.com/settings/appearance — RikkaHub theme model (light/dark pairs, preset theme list) used for naming
- https://github.com/viniciusoike/claudeplot — Anthropic/Claude brand colors (#D97757 clay, #F5F4EF cream)
- https://colorarchive.org/brands/anthropic/ — Anthropic brand palette cross-check
- https://github.com/catppuccin/catppuccin — Catppuccin Latte/Mocha used as sanity reference for dark surface ladders
- https://www.nordtheme.com/ — Nord palette (cool blue-gray) reference for tiesen
- https://ethanschoonover.com/solarized/ — Solarized warm/cool base ladders reference for claude and amber-mono
- https://ui.shadcn.com/docs/theming — shadcn/ui semantic token model (background/card/popover/border/primary) mapped onto the 14 DSH tokens
- D:\deepseek-harness\resources\app.asar — DSH's own --dsw-alias-* defaults (light #FFFFFF/#0F1115, dark #151517, sidebar #F9FAFB/#1B1B1C) used to anchor the default theme
- https://fonts.google.com/noto/specimen/Noto+Serif+SC — Noto Serif SC in the serif stack
- https://www.jetbrains.com/lp/mono/ — JetBrains Mono in the mono stack
- https://github.com/lxgw/LxgwWenKai — LXGW WenKai (霞鹜文楷) in the kai stack
- https://github.com/be5invis/Sarasa-Gothic — Sarasa Mono SC for monospaced CJK

Verification: `palettes.json` parses with both `ConvertFrom-Json` (PowerShell) and `JSON.parse` (Node).
