/**
 * Client half of the personalization bundle.
 *
 * Personalization is applied as a single alias-token override layer on the
 * theme service (`ctx.theme.overrideTokens`), so every palette carries a light
 * and a dark value and the user's native light/dark/system preference keeps
 * working underneath. Font families ride in the same layer as `--dsh-font-*`
 * variables, and the interface text size uses the theme service's own
 * persisted `text` font-size write so it survives reloads and shares the
 * native Ctrl/Cmd +/- shortcuts.
 *
 * Surfaces: a trigger in `sidebar.footer.action` (bottom-left, beside Settings)
 * opening a frame overlay popover, plus a `settings.section` page with the same
 * content. All copy goes through the client locale service, so the panel follows
 * the app language (zh / en).
 */
window.__ModuleLoader__.load({
  id: '@solvashq/dsh-theme',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useSyncExternalStore } = React;

    const NS = 'dsh.theme';
    const SOURCE = '@solvashq/dsh-theme';
    const STORAGE_KEY = 'dsh.theme.v1';
    /** Previous storage key, still read once so an open session migrates its cache. */
    const LEGACY_STORAGE_KEY = 'dsh.personalization.v1';
    /** Host settings entry id (the bundle patch row id) holding the durable prefs. */
    const SETTINGS_ENTRY_ID = 'dsh-theme';
    const TEXT_SIZE_DEFAULT = 14;
    const TEXT_SIZE_MIN = 10;
    const TEXT_SIZE_MAX = 22;

    /** Palette anchors: the 14 tokens the research pass locked per mode. */
    const PALETTES = [{"id":"warm","light":{"bgBase":"#F8F7F4","bgLayer1":"#FFFFFF","bgLayer2":"#F2F0EA","bgOverlay":"#FFFDF8","borderL1":"#E8E4DB","borderL2":"#D6D0C3","brandPrimary":"#2F6B50","labelPrimary":"#191814","labelSecondary":"#5F5A51","stateError":"#C0362C","stateIdle":"#948E82","stateSuccess":"#2E7D4F","stateWarn":"#966300","sidebarFill":"#F1EFE9"},"dark":{"bgBase":"#141413","bgLayer1":"#1D1C1A","bgLayer2":"#262421","bgOverlay":"#2C2A26","borderL1":"#302E29","borderL2":"#433F38","brandPrimary":"#3F8560","labelPrimary":"#F1EFE9","labelSecondary":"#ABA599","stateError":"#E5675C","stateIdle":"#726C61","stateSuccess":"#5DB583","stateWarn":"#D9A441","sidebarFill":"#101010"}},{"id":"mono","light":{"bgBase":"#FFFFFF","bgLayer1":"#FFFFFF","bgLayer2":"#F4F4F4","bgOverlay":"#FFFFFF","borderL1":"#E6E6E6","borderL2":"#D2D2D2","brandPrimary":"#171717","labelPrimary":"#0F0F0F","labelSecondary":"#5F5F5F","stateError":"#C62828","stateIdle":"#999999","stateSuccess":"#1E7B3C","stateWarn":"#8F6400","sidebarFill":"#F6F6F6"},"dark":{"bgBase":"#0A0A0A","bgLayer1":"#141414","bgLayer2":"#1D1D1D","bgOverlay":"#242424","borderL1":"#2A2A2A","borderL2":"#414141","brandPrimary":"#EDEDED","labelPrimary":"#FAFAFA","labelSecondary":"#A6A6A6","stateError":"#F26D6D","stateIdle":"#6B6B6B","stateSuccess":"#46B96B","stateWarn":"#CFA33F","sidebarFill":"#111111"}},{"id":"claude","light":{"bgBase":"#FAF8F1","bgLayer1":"#FEFDF9","bgLayer2":"#F2EFE5","bgOverlay":"#FFFEFA","borderL1":"#E5E1D4","borderL2":"#D2CCBC","brandPrimary":"#BB5A38","labelPrimary":"#3A3428","labelSecondary":"#6E6759","stateError":"#B23A2C","stateIdle":"#97907F","stateSuccess":"#3F7A51","stateWarn":"#9A6407","sidebarFill":"#F4F1E7"},"dark":{"bgBase":"#1F1E1B","bgLayer1":"#272622","bgLayer2":"#302E28","bgOverlay":"#35332C","borderL1":"#3B3833","borderL2":"#4E4A42","brandPrimary":"#BF6035","labelPrimary":"#F1EBDF","labelSecondary":"#B6AD9F","stateError":"#E8786A","stateIdle":"#8B8477","stateSuccess":"#6FB284","stateWarn":"#D9A54B","sidebarFill":"#1A1917"}},{"id":"claude-plus","light":{"bgBase":"#F2EEE3","bgLayer1":"#FBF8F0","bgLayer2":"#E9E4D6","bgOverlay":"#FFFCF5","borderL1":"#DCD5C4","borderL2":"#C7BEAA","brandPrimary":"#A33F1F","labelPrimary":"#211E17","labelSecondary":"#5B5447","stateError":"#9E2F22","stateIdle":"#8C8574","stateSuccess":"#2F6B43","stateWarn":"#8A5A00","sidebarFill":"#ECE7DA"},"dark":{"bgBase":"#161513","bgLayer1":"#1F1E1A","bgLayer2":"#292722","bgOverlay":"#2C2924","borderL1":"#35322D","borderL2":"#474339","brandPrimary":"#C5512B","labelPrimary":"#FBF6EC","labelSecondary":"#B9B1A2","stateError":"#EC7565","stateIdle":"#8A8376","stateSuccess":"#64AC7C","stateWarn":"#D8A344","sidebarFill":"#111110"}},{"id":"vermillion","light":{"bgBase":"#FAF7F3","bgLayer1":"#FFFDF9","bgLayer2":"#F3EEE7","bgOverlay":"#FFFFFF","borderL1":"#E7E0D6","borderL2":"#D5CBBE","brandPrimary":"#C63D22","labelPrimary":"#1E1B18","labelSecondary":"#635C52","stateError":"#B32F24","stateIdle":"#9C9488","stateSuccess":"#37754A","stateWarn":"#9A6203","sidebarFill":"#F4F0E9"},"dark":{"bgBase":"#171412","bgLayer1":"#201C19","bgLayer2":"#292420","bgOverlay":"#302A25","borderL1":"#36302B","borderL2":"#48403A","brandPrimary":"#D2492D","labelPrimary":"#F4EDE6","labelSecondary":"#B4A99B","stateError":"#EF6C5C","stateIdle":"#8A8175","stateSuccess":"#62AE7F","stateWarn":"#D7A03F","sidebarFill":"#120F0D"}},{"id":"amber-mono","light":{"bgBase":"#FAF9F6","bgLayer1":"#FFFFFF","bgLayer2":"#F3F1EC","bgOverlay":"#FFFEFB","borderL1":"#E6E2D9","borderL2":"#D3CDC0","brandPrimary":"#A16800","labelPrimary":"#1F1C16","labelSecondary":"#645D50","stateError":"#B03A2E","stateIdle":"#9A9284","stateSuccess":"#4A7A46","stateWarn":"#8A6100","sidebarFill":"#F2EFE8"},"dark":{"bgBase":"#191713","bgLayer1":"#221F1A","bgLayer2":"#2B2721","bgOverlay":"#322D26","borderL1":"#363129","borderL2":"#48423A","brandPrimary":"#A06B00","labelPrimary":"#F3EEE4","labelSecondary":"#B8AE9D","stateError":"#E97463","stateIdle":"#8C8476","stateSuccess":"#63AE7B","stateWarn":"#D9A63C","sidebarFill":"#131110"}},{"id":"mx-brutalist","light":{"bgBase":"#FFFFFF","bgLayer1":"#FFFFFF","bgLayer2":"#F2F2F2","bgOverlay":"#FFFFFF","borderL1":"#171717","borderL2":"#000000","brandPrimary":"#1732E0","labelPrimary":"#000000","labelSecondary":"#3A3A3A","stateError":"#D50000","stateIdle":"#6E6E6E","stateSuccess":"#00702F","stateWarn":"#7A5A00","sidebarFill":"#F7F7F7"},"dark":{"bgBase":"#000000","bgLayer1":"#0B0B0B","bgLayer2":"#161616","bgOverlay":"#1D1D1D","borderL1":"#3B3B3B","borderL2":"#E8E8E8","brandPrimary":"#3A5BFF","labelPrimary":"#FFFFFF","labelSecondary":"#AFAFAF","stateError":"#FF3B30","stateIdle":"#8A8A8A","stateSuccess":"#2BD964","stateWarn":"#FFD60A","sidebarFill":"#0B0B0B"}},{"id":"tiesen","light":{"bgBase":"#F6F8F9","bgLayer1":"#FFFFFF","bgLayer2":"#EDF1F2","bgOverlay":"#FFFFFF","borderL1":"#E0E6E7","borderL2":"#C9D3D5","brandPrimary":"#2E6B6E","labelPrimary":"#15242A","labelSecondary":"#56676D","stateError":"#B23F39","stateIdle":"#849699","stateSuccess":"#2C7A55","stateWarn":"#94660D","sidebarFill":"#EEF2F3"},"dark":{"bgBase":"#0F1618","bgLayer1":"#172023","bgLayer2":"#1F2A2D","bgOverlay":"#243034","borderL1":"#253337","borderL2":"#33464A","brandPrimary":"#3E8B86","labelPrimary":"#E7EFEF","labelSecondary":"#9DAFB2","stateError":"#E27C74","stateIdle":"#6C7E82","stateSuccess":"#58B98F","stateWarn":"#D5A24A","sidebarFill":"#0B1113"}},{"id":"vescrow","light":{"bgBase":"#FDFCFE","bgLayer1":"#FFFFFF","bgLayer2":"#F3F1F6","bgOverlay":"#FFFFFF","borderL1":"#E6E1E9","borderL2":"#D3CCDA","brandPrimary":"#1F2A6E","labelPrimary":"#14101C","labelSecondary":"#635D69","stateError":"#C22B2B","stateIdle":"#9A93A0","stateSuccess":"#2F7D5B","stateWarn":"#96680F","sidebarFill":"#F4F2F8"},"dark":{"bgBase":"#07080F","bgLayer1":"#0C0F1A","bgLayer2":"#121627","bgOverlay":"#171B30","borderL1":"#1E2340","borderL2":"#2C3358","brandPrimary":"#4C5BD9","labelPrimary":"#F6F4FA","labelSecondary":"#A29EAF","stateError":"#EC6A61","stateIdle":"#6A6578","stateSuccess":"#58B98A","stateWarn":"#D6A447","sidebarFill":"#090B16"}}];

    /**
     * Initial DIY definition; the panel's Custom card starts from Claude's bones.
     * A `null` slot means "derive from the background / text", so moving the
     * background keeps a mode coherent until the user pins a specific color.
     */
    const CUSTOM_DEFAULT = Object.freeze({
      light: Object.freeze({ bg: '#FAF8F1', layer: null, overlay: null, sidebar: null, label: null, border: null, accent: '#BB5A38' }),
      dark: Object.freeze({ bg: '#1F1E1B', layer: null, overlay: null, sidebar: null, label: null, border: null, accent: '#BB5A38' }),
      error: null,
      success: null,
      warn: null,
      bold: false,
    });

    /** Per-mode DIY color slots, in editor order, with the anchor each feeds. */
    const CUSTOM_FIELDS = ['bg', 'layer', 'overlay', 'sidebar', 'label', 'border', 'accent'];

    /* ------------------------------------------------------------------ */
    /* Locale dictionaries                                                 */
    /* ------------------------------------------------------------------ */

    const zh = {
      'trigger': '个性化主题',
      'title': '个性化',
      'subtitle': '主题配色、字体与界面字号',
      'close': '关闭',
      'section': '个性化',
      'appearance': '明暗',
      'mode.system': '跟随系统',
      'mode.light': '浅色',
      'mode.dark': '深色',
      'themeTitle': '主题色',
      'fontsTitle': '字体',
      'latin': '英文',
      'cjk': '中文',
      'codeFont': '代码字体',
      'fontSize': '界面字号',
      'reset': '恢复默认',
      'theme.none': '默认',
      'theme.warm': '暖白',
      'theme.mono': '单色',
      'theme.claude': '克劳德',
      'theme.claude-plus': '克劳德+',
      'theme.vermillion': '朱红',
      'theme.amber-mono': '琥珀单色',
      'theme.mx-brutalist': '粗暴极简',
      'theme.tiesen': '墨青',
      'theme.vescrow': '暗紫',
      'theme.custom': '自定义',
      'customTitle': '自定义主题',
      'back': '返回',
      'boldBorders': '加粗边框',
      'states': '状态色',
      'color.bg': '背景',
      'color.layer': '卡片',
      'color.overlay': '弹层',
      'color.sidebar': '侧栏',
      'color.label': '文字',
      'color.border': '边框',
      'color.accent': '强调色',
      'color.error': '错误',
      'color.success': '成功',
      'color.warn': '警告',
      'font.latin.system': '跟随系统',
      'font.latin.humanist': '人本无衬线',
      'font.latin.serif': '衬线',
      'font.latin.rounded': '圆润',
      'font.latin.mono': '等宽',
      'font.latin.kai': '手写衬线',
      'font.cjk.system': '跟随系统',
      'font.cjk.yahei': '微软雅黑',
      'font.cjk.source-han': '思源黑体',
      'font.cjk.serif': '思源宋体',
      'font.cjk.kai': '霞鹜文楷',
      'font.cjk.mono': '等宽',
      'font.cjk.rounded': '圆体',
      'code.default': '跟随系统',
      'code.cascadia': 'Cascadia Code',
      'code.jetbrains': 'JetBrains Mono',
      'code.fira': 'Fira Code',
      'code.sf-mono': 'SF Mono',
      'code.sarasa': 'Sarasa Mono SC',
    };

    const en = {
      'trigger': 'Personalization theme',
      'title': 'Personalization',
      'subtitle': 'Theme palette, fonts, and text size',
      'close': 'Close',
      'section': 'Personalization',
      'appearance': 'Appearance',
      'mode.system': 'System',
      'mode.light': 'Light',
      'mode.dark': 'Dark',
      'themeTitle': 'Theme color',
      'fontsTitle': 'Fonts',
      'latin': 'Latin',
      'cjk': 'Chinese',
      'codeFont': 'Code font',
      'fontSize': 'Text size',
      'reset': 'Reset',
      'theme.none': 'Default',
      'theme.warm': 'Warm',
      'theme.mono': 'Mono',
      'theme.claude': 'Claude',
      'theme.claude-plus': 'Claude+',
      'theme.vermillion': 'Vermillion',
      'theme.amber-mono': 'Amber Mono',
      'theme.mx-brutalist': 'MX Brutalist',
      'theme.tiesen': 'Tiesen',
      'theme.vescrow': 'Vescrow',
      'theme.custom': 'Custom',
      'customTitle': 'Custom theme',
      'back': 'Back',
      'boldBorders': 'Bold borders',
      'states': 'Status colors',
      'color.bg': 'Background',
      'color.layer': 'Card',
      'color.overlay': 'Popover',
      'color.sidebar': 'Sidebar',
      'color.label': 'Text',
      'color.border': 'Border',
      'color.accent': 'Accent',
      'color.error': 'Error',
      'color.success': 'Success',
      'color.warn': 'Warning',
      'font.latin.system': 'System',
      'font.latin.humanist': 'Humanist',
      'font.latin.serif': 'Serif',
      'font.latin.rounded': 'Rounded',
      'font.latin.mono': 'Monospace',
      'font.latin.kai': 'Palatino',
      'font.cjk.system': 'System',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Mono',
      'font.cjk.rounded': 'Rounded',
      'code.default': 'System default',
      'code.cascadia': 'Cascadia Code',
      'code.jetbrains': 'JetBrains Mono',
      'code.fira': 'Fira Code',
      'code.sf-mono': 'SF Mono',
      'code.sarasa': 'Sarasa Mono SC',
    };

    /* ------------------------------------------------------------------ */
    /* Color utilities and palette token generation                        */
    /* ------------------------------------------------------------------ */

    function hexToRgb(hex) {
      const raw = String(hex).replace('#', '');
      const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
      };
    }

    function rgbToHex(rgb) {
      return '#' + [rgb.r, rgb.g, rgb.b]
        .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
        .join('');
    }

    /** Mix `ratio` of `b` into `a` (0 keeps a, 1 returns b). */
    function mix(a, b, ratio) {
      const left = hexToRgb(a);
      const right = hexToRgb(b);
      return rgbToHex({
        r: left.r + (right.r - left.r) * ratio,
        g: left.g + (right.g - left.g) * ratio,
        b: left.b + (right.b - left.b) * ratio,
      });
    }

    function withAlpha(color, alpha) {
      const value = Math.max(0, Math.min(255, Math.round(alpha * 255)));
      return color + value.toString(16).padStart(2, '0');
    }

    function luminance(color) {
      const rgb = hexToRgb(color);
      const channel = (v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
    }

    function contrast(a, b) {
      const left = luminance(a);
      const right = luminance(b);
      const high = Math.max(left, right);
      const low = Math.min(left, right);
      return (high + 0.05) / (low + 0.05);
    }

    /** Contrast-safe label for a filled accent surface. */
    function onColor(accent) {
      return contrast(accent, '#ffffff') >= contrast(accent, '#111111') ? '#ffffff' : '#111111';
    }

    function isHexColor(value) {
      return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
    }

    /** Push a color toward black or white until it clears the contrast target (best effort). */
    function ensureContrast(color, background, target) {
      const ink = luminance(background) > 0.42 ? '#08080a' : '#f8f6f2';
      let value = color;
      for (let step = 0; step < 16 && contrast(value, background) < target; step += 1) {
        value = mix(value, ink, 0.14);
      }
      return value;
    }

    /**
     * The 14 anchors for one DIY mode. `extra` may pin any of layer / overlay /
     * sidebar / label / border; everything unpinned derives from the background
     * and text so a background change keeps the mode coherent.
     */
    function deriveAnchors(background, accent, bold, extras) {
      const extra = extras || {};
      const light = luminance(background) > 0.42;
      const ink = light ? mix(background, '#0B0B0C', 0.9) : mix(background, '#F7F5F1', 0.9);
      const label = extra.label || ensureContrast(ink, background, 12);
      const label2 = ensureContrast(mix(label, background, 0.42), background, 4.5);
      const brand = ensureContrast(accent, background, 3);
      const border2 = extra.border || (bold ? label : mix(background, label, 0.24));
      const border1 = extra.border
        ? mix(background, border2, bold ? 0.8 : 0.5)
        : bold
          ? mix(background, label, 0.55)
          : mix(background, label, 0.13);
      const layer1 = extra.layer || (light ? mix(background, '#FFFFFF', 0.6) : mix(background, label, 0.07));
      const layer2 = light ? mix(layer1, label, 0.05) : mix(layer1, label, 0.06);
      const overlay = extra.overlay || (light ? mix(layer1, '#FFFFFF', 0.5) : mix(layer1, label, 0.08));
      const sidebar = extra.sidebar || (light ? mix(background, label, 0.025) : mix(background, '#000000', 0.3));
      const error = ensureContrast(extra.error || (light ? '#C0362C' : '#E5675C'), background, 4.4);
      const success = ensureContrast(extra.success || (light ? '#2E7D4F' : '#5DB583'), background, 4.4);
      const warn = ensureContrast(extra.warn || (light ? '#966300' : '#D9A441'), background, 4.4);
      return {
        bgBase: background,
        bgLayer1: layer1,
        bgLayer2: layer2,
        bgOverlay: overlay,
        borderL1: border1,
        borderL2: border2,
        brandPrimary: brand,
        labelPrimary: label,
        labelSecondary: label2,
        stateError: error,
        stateIdle: mix(label, background, light ? 0.52 : 0.45),
        stateSuccess: success,
        stateWarn: warn,
        sidebarFill: sidebar,
      };
    }

    let customPaletteCache = { input: null, output: null };

    function customPalette(custom) {
      if (customPaletteCache.input === custom) return customPaletteCache.output;
      const shared = { error: custom.error, success: custom.success, warn: custom.warn };
      const palette = {
        id: 'custom',
        light: deriveAnchors(custom.light.bg, custom.light.accent, custom.bold, Object.assign({}, custom.light, shared)),
        dark: deriveAnchors(custom.dark.bg, custom.dark.accent, custom.bold, Object.assign({}, custom.dark, shared)),
      };
      customPaletteCache = { input: custom, output: palette };
      return palette;
    }

    function paletteFor(pref) {
      if (pref.palette === 'custom') return customPalette(pref.custom);
      for (const palette of PALETTES) if (palette.id === pref.palette) return palette;
      return null;
    }

    function buildTokens(palette) {
      const perMode = {};
      for (const mode of ['light', 'dark']) {
        const tokens = {};
        const p = palette[mode];
        const isLight = mode === 'light';
        const bg = p.bgBase;
        const l1 = p.bgLayer1;
        const l2 = p.bgLayer2;
        const overlay = p.bgOverlay;
        const sidebar = p.sidebarFill;
        const label = p.labelPrimary;
        const label2 = p.labelSecondary;
        const brand = p.brandPrimary;
        const brandText = onColor(brand);
        const error = p.stateError;
        const success = p.stateSuccess;
        const warn = p.stateWarn;
        const idle = p.stateIdle;
        const border1 = p.borderL1;
        const border2 = p.borderL2;
        const border3 = mix(border2, label2, 0.45);
        const border4 = mix(border2, label2, 0.75);
        const layer3 = mix(l2, label, isLight ? 0.06 : 0.08);
        const codeBg = isLight ? mix(l1, label, 0.04) : mix(bg, label, 0.06);
        const label3 = mix(label2, bg, 0.3);
        const labelDim = mix(label, bg, 0.86);
        const hoverSolid = isLight ? l2 : layer3;
        const bubble = isLight ? mix(l1, brand, 0.08) : l2;
        const bubbleHi = isLight ? mix(bubble, brand, 0.16) : layer3;
        const menuFill = 'color-mix(in srgb, ' + overlay + ' 94%, transparent)';
        const brandHover = mix(brand, brandText, 0.18);
        const toastBg = isLight ? mix(label, l1, 0.22) : layer3;
        const toastLabel = isLight ? '#ffffff' : label;
        const secondaryOn = (color) => mix(color, label, 0.18);

        tokens['--dsw-alias-bg-base'] = bg;
        tokens['--dsw-alias-bg-layer-1'] = l1;
        tokens['--dsw-alias-bg-layer-2'] = l2;
        tokens['--dsw-alias-bg-layer-3'] = layer3;
        tokens['--dsw-alias-bg-overlay'] = overlay;
        tokens['--dsw-alias-bg-document-preview'] = l2;
        tokens['--dsw-alias-bg-module-platform'] = l2;
        tokens['--dsw-alias-bg-multi-select'] = layer3;
        tokens['--dsw-alias-bg-skeleton'] = withAlpha(label, 0.08);
        tokens['--dsw-alias-bg-document-selection'] = 'color-mix(in srgb, ' + brand + ' 28%, transparent)';
        tokens['--dsw-specific-bubble'] = bubble;
        tokens['--dsw-specific-bubble-highlight'] = bubbleHi;
        tokens['--dsw-specific-input-major'] = isLight ? l1 : l2;
        tokens['--dsw-specific-selector'] = layer3;
        tokens['--dsw-specific-tip'] = l2;
        tokens['--dsw-specific-menu'] = menuFill;
        tokens['--dsw-specific-sidebar-fill'] = sidebar;
        tokens['--dsw-specific-sidebar-nav-item-hover'] = mix(sidebar, label, isLight ? 0.05 : 0.08);
        tokens['--dsw-specific-sidebar-nav-item-active'] = mix(sidebar, brand, isLight ? 0.1 : 0.16);
        tokens['--dsw-specific-sidebar-nav-item-active-accent'] = mix(sidebar, brand, isLight ? 0.16 : 0.28);
        tokens['--dsw-alias-menu-group-header-fill'] = menuFill;
        tokens['--dsw-alias-menu-icon'] = label2;
        tokens['--dsw-alias-border-l1'] = border1;
        tokens['--dsw-alias-border-l2'] = border2;
        tokens['--dsw-alias-border-l3'] = border3;
        tokens['--dsw-alias-border-l4'] = border4;
        tokens['--dsw-alias-border-l2-darkmode-thin'] = border1;
        tokens['--dsw-alias-label-primary'] = label;
        tokens['--dsw-alias-label-primary-bluish'] = label;
        tokens['--dsw-alias-label-primary-dimmed'] = mix(label, bg, 0.06);
        tokens['--dsw-alias-label-secondary'] = label2;
        tokens['--dsw-alias-label-tertiary'] = label3;
        tokens['--dsw-alias-label-caption'] = label3;
        tokens['--dsw-alias-label-dimmed'] = labelDim;
        tokens['--dsw-alias-label-document-preview'] = label2;
        tokens['--dsw-alias-label-primary-foreground'] = brandText;
        tokens['--dsw-alias-label-primary-inverted'] = brandText;
        tokens['--dsw-alias-link'] = brand;
        tokens['--dsw-alias-brand-primary'] = brand;
        tokens['--dsw-alias-brand-primary-invert'] = brand;
        tokens['--dsw-alias-brand-text'] = brandText;
        tokens['--dsw-alias-state-business-primary'] = brand;
        tokens['--dsw-alias-state-business-tertiary'] = mix(bg, brand, 0.12);
        tokens['--dsw-alias-interactive-bg-hover'] = withAlpha(label, 0.06);
        tokens['--dsw-alias-interactive-bg-active'] = withAlpha(label, 0.1);
        tokens['--dsw-alias-interactive-bg-hover-accent'] = withAlpha(label, 0.14);
        tokens['--dsw-alias-interactive-bg-hover-solid'] = hoverSolid;
        tokens['--dsw-alias-interactive-bg-hover-danger'] = 'color-mix(in srgb, ' + error + ' 10%, transparent)';
        tokens['--dsw-alias-button-primary-hover'] = brandHover;
        tokens['--dsw-alias-button-primary-dimmed'] = layer3;
        tokens['--dsw-alias-button-contrast-fill'] = isLight ? label2 : label;
        tokens['--dsw-alias-button-elevated-fill'] = l1;
        tokens['--dsw-alias-button-floating-fill'] = l1;
        tokens['--dsw-alias-button-floating-hover'] = l2;
        tokens['--dsw-alias-button-ghost-active-fill'] = l2;
        tokens['--dsw-alias-button-ghost-active-hover'] = layer3;
        tokens['--dsw-alias-button-ghost-active-border'] = label3;
        tokens['--dsw-alias-button-info-fill'] = brand;
        tokens['--dsw-alias-button-info-hover'] = brandHover;
        tokens['--dsw-alias-state-error-primary'] = error;
        tokens['--dsw-alias-state-error-secondary'] = secondaryOn(error);
        tokens['--dsw-alias-state-success-primary'] = success;
        tokens['--dsw-alias-state-success-secondary'] = secondaryOn(success);
        tokens['--dsw-alias-state-success-tertiary'] = mix(bg, success, 0.12);
        tokens['--dsw-alias-state-warn-primary'] = warn;
        tokens['--dsw-alias-state-warn-secondary'] = secondaryOn(warn);
        tokens['--dsw-alias-state-warn-tertiary'] = mix(bg, warn, 0.12);
        tokens['--dsw-alias-state-warn-label'] = mix(warn, label, 0.1);
        tokens['--dsw-alias-state-idle-primary'] = idle;
        tokens['--dsw-alias-markdown-code-block'] = codeBg;
        tokens['--dsw-alias-markdown-code-block-banner'] = isLight ? l2 : layer3;
        tokens['--dsw-alias-markdown-code-segment-selected'] = layer3;
        tokens['--dsw-alias-markdown-code-segment-unselected'] = codeBg;
        tokens['--dsw-alias-markdown-inline-code'] = codeBg;
        tokens['--dsw-alias-markdown-placeholder'] = l2;
        tokens['--dsw-alias-markdown-tag'] = l2;
        tokens['--dsw-alias-markdown-citation'] = l2;
        tokens['--dsw-alias-code-diff-added'] = 'color-mix(in srgb, ' + success + ' 14%, transparent)';
        tokens['--dsw-alias-code-diff-deleted'] = 'color-mix(in srgb, ' + error + ' 14%, transparent)';
        tokens['--dsw-alias-file-diff-added-bg'] = mix(bg, success, 0.14);
        tokens['--dsw-alias-file-diff-added-gutter'] = mix(bg, success, 0.08);
        tokens['--dsw-alias-file-diff-added-marker'] = success;
        tokens['--dsw-alias-file-diff-deleted-bg'] = mix(bg, error, 0.14);
        tokens['--dsw-alias-file-diff-deleted-gutter'] = mix(bg, error, 0.08);
        tokens['--dsw-alias-file-diff-deleted-marker'] = error;
        tokens['--dsw-alias-scrollbar-bg-l1'] = withAlpha(label, 0.16);
        tokens['--dsw-alias-scrollbar-bg-l2'] = withAlpha(label, 0.22);
        tokens['--dsw-alias-scrollbar-hover-l1'] = withAlpha(label, 0.26);
        tokens['--dsw-alias-scrollbar-hover-l2'] = withAlpha(label, 0.34);
        tokens['--dsw-alias-switch-thumb'] = isLight ? '#ffffff' : mix(l1, label, 0.25);
        tokens['--dsw-alias-toast-bg'] = toastBg;
        tokens['--dsw-alias-toast-label'] = toastLabel;
        tokens['--dsw-alias-tooltip-bg'] = toastBg;
        tokens['--dsw-alias-onboarding-accent'] = brand;
        tokens['--dsw-alias-onboarding-secondary-fill'] = l1;
        tokens['--dsw-alias-onboarding-card-fill'] = 'color-mix(in srgb, ' + l1 + ' 82%, transparent)';
        tokens['--dsw-alias-onboarding-checkbox-border'] = withAlpha(label, 0.2);

        perMode[mode] = tokens;
      }
      const merged = {};
      for (const name of Object.keys(perMode.light)) {
        merged[name] = { light: perMode.light[name], dark: perMode.dark[name] };
      }
      return merged;
    }

    /* ------------------------------------------------------------------ */
    /* Font data                                                           */
    /* ------------------------------------------------------------------ */

    const LATIN_FONTS = [
      { id: 'system', families: [], generic: null },
      { id: 'humanist', families: ['Inter', 'Inter Variable', 'Segoe UI Variable Display', 'Segoe UI', 'Helvetica Neue', 'Arial'], generic: 'sans-serif' },
      { id: 'serif', families: ['Source Serif 4', 'Source Serif Pro', 'Iowan Old Style', 'Georgia', 'Times New Roman'], generic: 'serif' },
      { id: 'rounded', families: ['SF Pro Rounded', 'Hiragino Maru Gothic ProN', 'Nunito', 'Quicksand', 'Segoe UI'], generic: 'sans-serif' },
      { id: 'mono', families: ['JetBrains Mono', 'Cascadia Code', 'SF Mono', 'Consolas'], generic: 'monospace' },
      { id: 'kai', families: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'Georgia'], generic: 'serif' },
    ];

    const CJK_FONTS = [
      { id: 'system', families: [], generic: null },
      { id: 'yahei', families: ['Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC'], generic: 'sans-serif' },
      { id: 'source-han', families: ['Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei'], generic: 'sans-serif' },
      { id: 'serif', families: ['Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', 'SimSun'], generic: 'serif' },
      { id: 'kai', families: ['LXGW WenKai', 'LXGW WenKai Screen', 'Kaiti SC', 'STKaiti', 'KaiTi'], generic: 'serif' },
      { id: 'mono', families: ['Sarasa Mono SC', 'Sarasa Term SC', 'Noto Sans Mono CJK SC', 'Microsoft YaHei'], generic: 'monospace' },
      { id: 'rounded', families: ['YouYuan', 'Yuanti SC', 'PingFang SC', 'Microsoft YaHei'], generic: 'sans-serif' },
    ];

    const CODE_FONTS = [
      { id: 'default', stack: '' },
      { id: 'cascadia', stack: '"Cascadia Code", "Cascadia Mono", Consolas, monospace' },
      { id: 'jetbrains', stack: '"JetBrains Mono", "Cascadia Code", "Consolas", monospace' },
      { id: 'fira', stack: '"Fira Code", "Cascadia Code", "Consolas", monospace' },
      { id: 'sf-mono', stack: '"SF Mono", Menlo, Consolas, monospace' },
      { id: 'sarasa', stack: '"Sarasa Mono SC", "Sarasa Term SC", "Noto Sans Mono CJK SC", Consolas, monospace' },
    ];

    /** The shipped `--dsh-font-family-text-default` splits, used when one side is "System". */
    const DEFAULT_LATIN_FAMILIES = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial'];
    const DEFAULT_CJK_FAMILIES = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'];
    const DEFAULT_GENERIC = 'sans-serif';

    function findFont(list, id) {
      for (const font of list) if (font.id === id) return font;
      return list[0];
    }

    function composeTextStack(latinId, cjkId) {
      const latin = findFont(LATIN_FONTS, latinId);
      const cjk = findFont(CJK_FONTS, cjkId);
      if (latin.families.length === 0 && cjk.families.length === 0) return '';
      const latinFamilies = latin.families.length > 0 ? latin.families : DEFAULT_LATIN_FAMILIES;
      const cjkFamilies = cjk.families.length > 0 ? cjk.families : DEFAULT_CJK_FAMILIES;
      const generic = cjk.generic || latin.generic || DEFAULT_GENERIC;
      return latinFamilies
        .concat(cjkFamilies)
        .map((name) => '"' + name + '"')
        .join(', ') + ', ' + generic;
    }

    function collectTokens(pref) {
      const out = {};
      const palette = paletteFor(pref);
      if (palette) {
        const generated = buildTokens(palette);
        for (const name of Object.keys(generated)) out[name] = generated[name];
      }
      const text = composeTextStack(pref.latin, pref.cjk);
      if (text) out['--dsh-font-family-text'] = { light: text, dark: text };
      const codeFont = findFont(CODE_FONTS, pref.code);
      if (codeFont.stack) out['--dsh-font-family-code'] = { light: codeFont.stack, dark: codeFont.stack };
      return out;
    }

    /* ------------------------------------------------------------------ */
    /* Preference stores                                                   */
    /* ------------------------------------------------------------------ */

    function createStore(initial) {
      let value = initial;
      const listeners = new Set();
      return {
        get() {
          return value;
        },
        set(next) {
          if (Object.is(next, value)) return;
          value = next;
          for (const listener of Array.from(listeners)) listener();
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
    }

    function useStore(store) {
      return useSyncExternalStore(store.subscribe, store.get, store.get);
    }

    function defaultCustom() {
      return {
        light: Object.assign({}, CUSTOM_DEFAULT.light),
        dark: Object.assign({}, CUSTOM_DEFAULT.dark),
        error: null,
        success: null,
        warn: null,
        bold: false,
      };
    }

    function defaultPref() {
      return { palette: 'none', latin: 'system', cjk: 'system', code: 'default', custom: defaultCustom() };
    }

    function readModeColors(source) {
      const mode = { bg: null, layer: null, overlay: null, sidebar: null, label: null, border: null, accent: null };
      if (!source || typeof source !== 'object') return mode;
      for (const key of CUSTOM_FIELDS) if (isHexColor(source[key])) mode[key] = source[key];
      return mode;
    }

    function readCustom(source) {
      const custom = defaultCustom();
      if (!source || typeof source !== 'object') return custom;
      const legacyAccent = isHexColor(source.accent) ? source.accent : null;
      if (source.light || source.dark) {
        const light = readModeColors(source.light);
        const dark = readModeColors(source.dark);
        if (light.bg) custom.light = light;
        if (dark.bg) custom.dark = dark;
      } else {
        // v1 shape: flat lightBg / darkBg / accent / bold.
        if (isHexColor(source.lightBg)) custom.light.bg = source.lightBg;
        if (isHexColor(source.darkBg)) custom.dark.bg = source.darkBg;
      }
      // v1-v2 shared accent migrates into both modes.
      if (legacyAccent) {
        if (!custom.light.accent) custom.light.accent = legacyAccent;
        if (!custom.dark.accent) custom.dark.accent = legacyAccent;
      }
      if (!isHexColor(custom.light.accent)) custom.light.accent = CUSTOM_DEFAULT.light.accent;
      if (!isHexColor(custom.dark.accent)) custom.dark.accent = CUSTOM_DEFAULT.dark.accent;
      if (isHexColor(source.error)) custom.error = source.error;
      if (isHexColor(source.success)) custom.success = source.success;
      if (isHexColor(source.warn)) custom.warn = source.warn;
      custom.bold = source.bold === true;
      return custom;
    }

    function normalizePrefData(data) {
      const fallback = defaultPref();
      if (!data || typeof data !== 'object') return fallback;
      const palette =
        typeof data.palette === 'string' &&
        (data.palette === 'none' || data.palette === 'custom' || PALETTES.some((item) => item.id === data.palette))
          ? data.palette
          : 'none';
      const latin = LATIN_FONTS.some((font) => font.id === data.latin) ? data.latin : 'system';
      const cjk = CJK_FONTS.some((font) => font.id === data.cjk) ? data.cjk : 'system';
      const code = CODE_FONTS.some((font) => font.id === data.code) ? data.code : 'default';
      return { palette, latin, cjk, code, custom: readCustom(data.custom) };
    }

    function readPref() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!raw) return defaultPref();
        return normalizePrefData(JSON.parse(raw));
      } catch (error) {
        return defaultPref();
      }
    }

    function serializePref(pref) {
      return JSON.stringify({
        palette: pref.palette,
        latin: pref.latin,
        cjk: pref.cjk,
        code: pref.code,
        custom: pref.custom,
      });
    }

    function persistPref(pref) {
      try {
        window.localStorage.setItem(STORAGE_KEY, serializePref(pref));
      } catch (error) {
        /* localStorage is only the per-session cache/fallback. */
      }
    }

    const prefStore = createStore(readPref());
    const themeStore = createStore({ text: TEXT_SIZE_DEFAULT, preference: 'system' });
    const uiStore = createStore({ open: false });

    /** Engine handle installed by apply(); components call through it. */
    let engine = null;

    /* Host-backed settings form installed by apply(); this is what survives restarts. */
    let settingsForm = null;
    let hostReady = false;
    let lastPushedJson = '';
    let localDirtyBeforeHost = false;
    let hostFallbackTimer = 0;

    /* Coalesce the expensive theme-layer swap while a color picker streams input. */
    const APPLY_MIN_INTERVAL_MS = 70;
    const PERSIST_DELAY_MS = 220;
    let applyTimer = 0;
    let lastApplyAt = 0;
    let persistTimer = 0;

    function hasWindowTimers() {
      return typeof window !== 'undefined' && typeof window.setTimeout === 'function';
    }

    function runApply() {
      applyTimer = 0;
      lastApplyAt = Date.now();
      if (engine) engine.apply(prefStore.get());
    }

    function scheduleApply() {
      if (applyTimer !== 0) return;
      const wait = Math.max(0, APPLY_MIN_INTERVAL_MS - (Date.now() - lastApplyAt));
      if (!hasWindowTimers() || wait === 0) {
        runApply();
        return;
      }
      applyTimer = window.setTimeout(runApply, wait);
    }

    function runPersist() {
      persistTimer = 0;
      persistPref(prefStore.get());
      pushHostPref();
    }

    function schedulePersist() {
      if (persistTimer !== 0) return;
      if (!hasWindowTimers()) {
        runPersist();
        return;
      }
      persistTimer = window.setTimeout(runPersist, PERSIST_DELAY_MS);
    }

    /** Push the current preference JSON into the Host settings document. */
    function pushHostPref() {
      if (!settingsForm || !hostReady) return;
      const json = serializePref(prefStore.get());
      if (json === lastPushedJson) return;
      lastPushedJson = json;
      try {
        const result = settingsForm.set('preferences', json);
        if (result && typeof result.catch === 'function') {
          result.catch(() => {
            if (lastPushedJson === json) lastPushedJson = '';
          });
        }
      } catch (error) {
        lastPushedJson = '';
      }
    }

    /**
     * Adopt the durable Host preferences once the settings mirror serves them.
     * Returns true once a snapshot arrived; a session that changed preferences
     * before the snapshot wins over the stored value (and is pushed instead).
     */
    function adoptHostPref() {
      if (!settingsForm || typeof settingsForm.getSnapshot !== 'function') return false;
      const snapshot = settingsForm.getSnapshot();
      const value = snapshot && snapshot.value;
      if (!value || typeof value !== 'object') return false;
      hostReady = true;
      if (localDirtyBeforeHost) {
        localDirtyBeforeHost = false;
        pushHostPref();
        return true;
      }
      const raw = typeof value.preferences === 'string' ? value.preferences : '';
      if (!raw) {
        lastPushedJson = '';
        if (serializePref(prefStore.get()) !== serializePref(defaultPref())) pushHostPref();
        return true;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch (error) {
        return true;
      }
      const next = normalizePrefData(data);
      const normalized = serializePref(next);
      lastPushedJson = raw;
      if (normalized !== serializePref(prefStore.get())) {
        prefStore.set(next);
        persistPref(next);
      }
      /* Upgrade an older stored shape (e.g. the shared accent) in place. */
      if (normalized !== raw) pushHostPref();
      return true;
    }

    function updatePref(patch) {
      if (!hostReady) localDirtyBeforeHost = true;
      const next = Object.assign({}, prefStore.get(), patch);
      prefStore.set(next);
      schedulePersist();
    }

    function updateCustom(patch) {
      const current = prefStore.get();
      const custom = Object.assign({}, current.custom, patch);
      updatePref({ palette: 'custom', custom });
    }

    function updateTextSize(px) {
      if (!engine) return;
      const value = Math.max(TEXT_SIZE_MIN, Math.min(TEXT_SIZE_MAX, Math.round(Number(px) || TEXT_SIZE_DEFAULT)));
      if (engine.theme.getTheme().fontSizes.text !== value) engine.theme.setFontSize('text', value);
    }

    function updateMode(id) {
      if (!engine) return;
      if (engine.theme.getTheme().preference !== id) engine.theme.setTheme(id);
    }

    function resetAll() {
      updatePref(defaultPref());
      if (engine) {
        const snapshot = engine.theme.getTheme();
        if (snapshot.fontSizes.text !== TEXT_SIZE_DEFAULT) engine.theme.setFontSize('text', TEXT_SIZE_DEFAULT);
        if (snapshot.preference !== 'system') engine.theme.setTheme('system');
      }
    }

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function IconPalette(props) {
      const size = props.size || 18;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M12 3.2a8.8 8.8 0 1 0 0 17.6h1.1a2.25 2.25 0 0 0 0-4.5h-.6a1.7 1.7 0 0 1 0-3.4h3.3a4.85 4.85 0 0 0 0-9.7H12Z',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
        }),
        h('circle', { cx: 8.1, cy: 10.4, r: 1.15, fill: 'currentColor' }),
        h('circle', { cx: 11.3, cy: 7.3, r: 1.15, fill: 'currentColor' }),
        h('circle', { cx: 15, cy: 8.7, r: 1.15, fill: 'currentColor' }),
      );
    }

    function IconChevron(props) {
      return h(
        'svg',
        {
          width: 12,
          height: 12,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: {
            display: 'block',
            transform: props.open ? 'rotate(180deg)' : 'none',
            transition: 'transform .12s ease',
          },
        },
        h('path', { d: 'm6 9 6 6 6-6', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    function IconCheck(props) {
      const size = props.size || 14;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'm4.5 12.5 5 5 10-11',
          stroke: 'currentColor',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function IconClose() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M6 6l12 12M18 6 6 18', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }),
      );
    }

    function IconBack() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M14.5 5 7.5 12l7 7',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function IconReset() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M4 5.5V10h4.5M4.6 9.2A8.2 8.2 0 1 1 4 14.5',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    /* ------------------------------------------------------------------ */
    /* Panel components                                                    */
    /* ------------------------------------------------------------------ */

    const THEME_IDS = ['none'].concat(PALETTES.map((palette) => palette.id)).concat(['custom']);

    function swatchFor(id, custom) {
      if (id === 'none') return { bg: '#ffffff', accent: '#4176e6' };
      if (id === 'custom') return { bg: custom.light.bg, accent: custom.light.accent };
      const palette = PALETTES.find((item) => item.id === id);
      if (!palette) return { bg: '#ffffff', accent: '#4176e6' };
      return { bg: palette.light.bgBase, accent: palette.light.brandPrimary };
    }

    function ModeControl(props) {
      const t = props.t;
      const modes = [
        { id: 'system', key: 'mode.system' },
        { id: 'light', key: 'mode.light' },
        { id: 'dark', key: 'mode.dark' },
      ];
      return h(
        'div',
        { className: 'dsph-modes', role: 'group', 'aria-label': t('appearance') },
        modes.map((mode) =>
          h(
            'button',
            {
              key: mode.id,
              type: 'button',
              className: 'dsph-mode',
              'aria-pressed': props.mode === mode.id,
              onClick: () => updateMode(mode.id),
            },
            t(mode.key),
          ),
        ),
      );
    }

    function ThemeGrid(props) {
      const t = props.t;
      return h(
        'div',
        { className: 'dsph-section dsph-sectionTheme' },
        h('div', { className: 'dsph-sectionTitle' }, h('span', null, t('themeTitle'))),
        h(
          'div',
          { className: 'dsph-themes', role: 'group', 'aria-label': t('themeTitle') },
          THEME_IDS.map((id) => {
            const swatch = swatchFor(id, props.custom);
            const active = props.value === id;
            return h(
              'button',
              {
                key: id,
                type: 'button',
                className: 'dsph-theme',
                'aria-pressed': active,
                title: t('theme.' + id),
                onClick: () => {
                  updatePref({ palette: id });
                  if (id === 'custom' && props.onCustom) props.onCustom();
                },
              },
              h('span', {
                className: 'dsph-swatch',
                style: {
                  background:
                    'linear-gradient(135deg, ' + swatch.bg + ' 0 50%, ' + swatch.accent + ' 50% 100%)',
                },
              }),
              h('span', { className: 'dsph-themeName' }, t('theme.' + id)),
              active ? h('span', { className: 'dsph-themeCheck' }, h(IconCheck, { size: 11 })) : null,
            );
          }),
        ),
      );
    }

    function ColorField(props) {
      return h(
        'label',
        { className: 'dsph-colorField', title: props.value },
        h('span', { className: 'dsph-colorLabel' }, props.label),
        h(
          'span',
          { className: 'dsph-colorSwatch', style: { background: props.value } },
          h('input', {
            type: 'color',
            className: 'dsph-colorInput',
            value: props.value,
            'aria-label': props.label,
            onChange: (event) => props.onChange(event.target.value),
          }),
        ),
      );
    }

    function CustomEditor(props) {
      const t = props.t;
      const custom = props.custom;
      const [mode, setMode] = useState('light');
      const anchors = customPalette(custom)[mode];
      const anchorKeys = {
        layer: 'bgLayer1',
        overlay: 'bgOverlay',
        sidebar: 'sidebarFill',
        label: 'labelPrimary',
        border: 'borderL2',
        accent: 'brandPrimary',
      };
      const fieldValue = (key) => custom[mode][key] || anchors[anchorKeys[key]];
      const setModeField = (key, value) => {
        const next = Object.assign({}, custom[mode], { [key]: value });
        updateCustom(mode === 'light' ? { light: next } : { dark: next });
      };
      return h(
        'div',
        { className: 'dsph-editor' },
        h(
          'div',
          { className: 'dsph-editorHead' },
          h(
            'button',
            { type: 'button', className: 'dsph-back', 'aria-label': t('back'), title: t('back'), onClick: props.onBack },
            h(IconBack),
          ),
          h('span', { className: 'dsph-editorTitle' }, t('customTitle')),
        ),
        h(
          'div',
          { className: 'dsph-modeTabs', role: 'group', 'aria-label': t('customTitle') },
          h(
            'button',
            { type: 'button', className: 'dsph-modeTab', 'aria-pressed': mode === 'light', onClick: () => setMode('light') },
            t('mode.light'),
          ),
          h(
            'button',
            { type: 'button', className: 'dsph-modeTab', 'aria-pressed': mode === 'dark', onClick: () => setMode('dark') },
            t('mode.dark'),
          ),
        ),
        h(
          'div',
          { className: 'dsph-colors' },
          CUSTOM_FIELDS.map((key) =>
            h(ColorField, {
              key: key,
              label: t('color.' + key),
              value: fieldValue(key),
              onChange: (value) => setModeField(key, value),
            }),
          ),
        ),
        h('div', { className: 'dsph-colorsTitle' }, t('states')),
        h(
          'div',
          { className: 'dsph-colors' },
          h(ColorField, {
            label: t('color.error'),
            value: custom.error || anchors.stateError,
            onChange: (value) => updateCustom({ error: value }),
          }),
          h(ColorField, {
            label: t('color.success'),
            value: custom.success || anchors.stateSuccess,
            onChange: (value) => updateCustom({ success: value }),
          }),
          h(ColorField, {
            label: t('color.warn'),
            value: custom.warn || anchors.stateWarn,
            onChange: (value) => updateCustom({ warn: value }),
          }),
        ),
        h(
          'div',
          { className: 'dsph-switchRow' },
          h('span', { className: 'dsph-switchText' }, t('boldBorders')),
          h(
            'button',
            {
              type: 'button',
              role: 'switch',
              'aria-checked': custom.bold,
              'aria-label': t('boldBorders'),
              className: 'dsph-switchButton',
              onClick: () => updateCustom({ bold: !custom.bold }),
            },
            h(
              'span',
              { className: 'dsph-switchTrack' + (custom.bold ? ' dsph-switchOn' : ''), 'aria-hidden': true },
              h('span', { className: 'dsph-switchThumb' }),
            ),
          ),
        ),
      );
    }

    function Select(props) {
      const t = props.t;
      const options = props.options;
      const current = findFont(options, props.value);
      return h(
        'div',
        { className: 'dsph-field' },
        h('div', { className: 'dsph-fieldLabel' }, props.label),
        h(
          'div',
          { className: 'dsph-select' },
          h(
            'button',
            {
              type: 'button',
              className: 'dsph-selectButton',
              'aria-haspopup': 'listbox',
              'aria-expanded': props.open,
              onClick: () => props.onToggle(props.open ? null : props.id),
            },
            h('span', { className: 'dsph-selectValue' }, t(props.prefix + current.id)),
            h(IconChevron, { open: props.open }),
          ),
          props.open
            ? h(
                'div',
                { className: 'dsph-menu', role: 'listbox', 'aria-label': props.label },
                options.map((option) =>
                  h(
                    'button',
                    {
                      key: option.id,
                      type: 'button',
                      role: 'option',
                      'aria-selected': option.id === props.value,
                      className: 'dsph-option',
                      onClick: () => {
                        props.onPick(props.id, option.id);
                        props.onToggle(null);
                      },
                    },
                    h('span', { className: 'dsph-optionLabel' }, t(props.prefix + option.id)),
                    option.id === props.value ? h(IconCheck, { size: 12 }) : null,
                  ),
                ),
              )
            : null,
        ),
      );
    }

    function PersonalizationContent(props) {
      const t = props.t;
      const pref = useStore(prefStore);
      const themeState = useStore(themeStore);
      const [openMenu, setOpenMenu] = useState(null);
      const [editingCustom, setEditingCustom] = useState(false);
      const percent = Math.round((themeState.text / TEXT_SIZE_DEFAULT) * 100) + '%';

      useEffect(() => {
        if (!openMenu) return undefined;
        const close = (event) => {
          const target = event.target;
          if (target instanceof Element && target.closest('.dsph-select')) return;
          setOpenMenu(null);
        };
        document.addEventListener('mousedown', close, true);
        return () => document.removeEventListener('mousedown', close, true);
      }, [openMenu]);

      return h(
        'div',
        { className: 'dsph-content' },
        h(ModeControl, { t: t, mode: themeState.preference }),
        pref.palette === 'custom' && editingCustom
          ? h(CustomEditor, { t: t, custom: pref.custom, onBack: () => setEditingCustom(false) })
          : h(ThemeGrid, {
              t: t,
              value: pref.palette,
              custom: pref.custom,
              onCustom: () => setEditingCustom(true),
            }),
        h(
          'div',
          { className: 'dsph-section' },
          h('div', { className: 'dsph-sectionTitle' }, h('span', null, t('fontsTitle'))),
          h(
            'div',
            { className: 'dsph-fontRow' },
            h(Select, {
              t: t,
              id: 'latin',
              prefix: 'font.latin.',
              label: t('latin'),
              value: pref.latin,
              options: LATIN_FONTS,
              open: openMenu === 'latin',
              onToggle: setOpenMenu,
              onPick: (role, id) => updatePref({ latin: id }),
            }),
            h(Select, {
              t: t,
              id: 'cjk',
              prefix: 'font.cjk.',
              label: t('cjk'),
              value: pref.cjk,
              options: CJK_FONTS,
              open: openMenu === 'cjk',
              onToggle: setOpenMenu,
              onPick: (role, id) => updatePref({ cjk: id }),
            }),
          ),
          h(
            'div',
            { className: 'dsph-fontRow dsph-fontRowSingle' },
            h(Select, {
              t: t,
              id: 'code',
              prefix: 'code.',
              label: t('codeFont'),
              value: pref.code,
              options: CODE_FONTS,
              open: openMenu === 'code',
              onToggle: setOpenMenu,
              onPick: (role, id) => updatePref({ code: id }),
            }),
          ),
        ),
        h(
          'div',
          { className: 'dsph-section dsph-sectionSize' },
          h(
            'div',
            { className: 'dsph-sectionTitle' },
            h('span', null, t('fontSize')),
            h('span', { className: 'dsph-sectionValue' }, percent),
          ),
          h('input', {
            type: 'range',
            className: 'dsph-slider',
            min: TEXT_SIZE_MIN,
            max: TEXT_SIZE_MAX,
            step: 1,
            value: themeState.text,
            'aria-label': t('fontSize'),
            onChange: (event) => updateTextSize(event.target.value),
          }),
        ),
      );
    }

    const BOLD_BORDER_CSS = 'body *{border-width:1px !important}';

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const STYLES = `
.dsph-trigger{position:relative;flex:none;width:28px;height:28px;padding:0;border:none;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .12s ease,color .12s ease}
.dsph-trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-trigger[aria-expanded='true']{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-trigger[data-active='true']{color:var(--dsw-alias-brand-primary)}
.dsph-triggerNarrow{width:36px;height:36px;border-radius:var(--dsw-radius-md,12px)}
.dsph-triggerDot{position:absolute;top:4px;right:5px;width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1.5px var(--dsw-specific-sidebar-fill)}
.dsph-panel{position:fixed;left:12px;bottom:64px;z-index:70;width:min(356px,calc(100vw - 24px));max-height:min(660px,calc(100vh - 84px));overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:11px 12px 11px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18));font-family:var(--dsw-font-family);pointer-events:auto}
.dsph-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:7px}
.dsph-title{font-size:15px;font-weight:600;line-height:22px;letter-spacing:.01em;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsph-headActions{display:flex;align-items:center;gap:2px;flex:none}
.dsph-reset{display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);height:24px;width:24px;cursor:pointer}
.dsph-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-close{flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dsph-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-reset:focus-visible,.dsph-close:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-page{display:flex;flex-direction:column;width:100%;max-width:720px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family)}
.dsph-pageHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px}
.dsph-pageTitle{font-size:16px;font-weight:600;line-height:24px}
.dsph-pageSub{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dsph-content{display:flex;flex-direction:column}
.dsph-modes{display:flex;gap:4px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);margin-bottom:2px}
.dsph-mode{flex:1;min-width:0;height:26px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:16px;cursor:pointer;padding:0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsph-mode:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-mode[aria-pressed='true']{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 .5px var(--dsw-alias-border-l2)}
.dsph-mode:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-section{display:flex;flex-direction:column;gap:7px;padding:8px 0 9px;border-top:.5px solid var(--dsw-alias-border-l1)}
.dsph-section:first-of-type{border-top:none}
.dsph-sectionTheme{gap:6px;padding-top:3px}
.dsph-sectionTitle{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-tertiary)}
.dsph-sectionValue{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dsph-themes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}
.dsph-theme{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:5px 4px 4px;border:.5px solid transparent;border-radius:9px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:11px;line-height:14px;min-width:0;outline:none}
.dsph-theme:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsph-theme[aria-pressed='true']{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.dsph-theme:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-swatch{width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18),0 0 0 .5px rgba(255,255,255,.06);flex:none}
.dsph-themeName{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary)}
.dsph-theme[aria-pressed='true'] .dsph-themeName{color:var(--dsw-alias-label-primary)}
.dsph-themeCheck{position:absolute;top:3px;right:4px;color:var(--dsw-alias-brand-primary);display:flex}
.dsph-custom{display:none}
.dsph-editor{display:flex;flex-direction:column;gap:7px;padding:1px 1px 2px}
.dsph-editorHead{display:flex;align-items:center;gap:6px;min-height:24px}
.dsph-back{flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dsph-back:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-back:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-editorTitle{flex:1;min-width:0;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsph-modeTabs{display:flex;gap:4px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}
.dsph-modeTab{flex:1;min-width:0;height:24px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:16px;cursor:pointer;padding:0 6px}
.dsph-modeTab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsph-modeTab[aria-pressed='true']{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 .5px var(--dsw-alias-border-l2)}
.dsph-modeTab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-colorsTitle{font-size:11px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-weight:500;margin-top:1px}
.dsph-colors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.dsph-colorField{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsph-colorLabel{font-size:10px;line-height:13px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsph-colorSwatch{position:relative;height:22px;border-radius:7px;border:.5px solid var(--dsw-alias-border-l2);box-shadow:inset 0 0 0 .5px rgba(0,0,0,.06);cursor:pointer;overflow:hidden}
.dsph-colorSwatch:hover{border-color:var(--dsw-alias-label-tertiary)}
.dsph-colorInput{position:absolute;inset:0;width:100%;height:100%;padding:0;margin:0;border:none;opacity:0;cursor:pointer}
.dsph-switchRow{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:3px 1px;color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px}
.dsph-switchButton{display:inline-flex;align-items:center;flex:none;padding:0;margin:0;border:none;border-radius:9px;background:transparent;cursor:pointer}
.dsph-switchButton:hover .dsph-switchTrack{border-color:var(--dsw-alias-label-tertiary)}
.dsph-switchButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsph-switchTrack{position:relative;flex:none;width:30px;height:18px;border-radius:9px;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l2);transition:background .12s ease}
.dsph-switchOn{background:var(--dsw-alias-brand-primary);border-color:transparent}
.dsph-switchThumb{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-switch-thumb,#fff);box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .12s ease}
.dsph-switchOn .dsph-switchThumb{transform:translateX(12px)}
.dsph-fontRow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dsph-fontRowSingle{grid-template-columns:1fr 1fr}
.dsph-field{display:flex;flex-direction:column;gap:3px;min-width:0}
.dsph-fieldLabel{font-size:11px;line-height:14px;color:var(--dsw-alias-label-tertiary)}
.dsph-select{position:relative;min-width:0}
.dsph-selectButton{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;height:28px;padding:0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:16px;cursor:pointer;min-width:0}
.dsph-selectButton:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsph-selectButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsph-selectValue{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsph-menu{position:absolute;left:0;right:0;bottom:calc(100% + 4px);z-index:2;max-height:210px;overflow:auto;padding:4px;border-radius:10px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18))}
.dsph-option{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;padding:6px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:16px;text-align:left;cursor:pointer}
.dsph-option:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsph-option[aria-selected='true']{color:var(--dsw-alias-brand-primary)}
.dsph-optionLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsph-sectionSize{padding-bottom:2px}
.dsph-slider{width:100%;min-width:0;height:18px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.dsph-slider:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsph-page .dsph-themes{grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px}
.dsph-page .dsph-colors{max-width:420px}
.dsph-page .dsph-modes{max-width:360px}
`;

    function StyleTag() {
      return h('style', { dangerouslySetInnerHTML: { __html: STYLES } });
    }

    function BoldBorderStyles() {
      return h('style', { 'data-dsph-bold': '', dangerouslySetInnerHTML: { __html: BOLD_BORDER_CSS } });
    }

    function ThemeTrigger(props) {
      const t = props.t;
      const wide = props.wide !== false;
      const open = useStore(uiStore).open;
      const pref = useStore(prefStore);
      const hasPreset = pref.palette !== 'none' && pref.palette !== 'custom';
      const hasFonts = pref.latin !== 'system' || pref.cjk !== 'system' || pref.code !== 'default';
      // A custom palette already recolors everything on screen, so its trigger
      // stays dot-free to keep the sidebar foot calm.
      const active = pref.palette === 'custom' ? false : hasPreset || hasFonts;
      return h(
        'button',
        {
          type: 'button',
          'data-dsph-trigger': '',
          className: 'dsph-trigger' + (wide ? '' : ' dsph-triggerNarrow'),
          'aria-label': t('trigger'),
          'aria-expanded': open,
          title: t('trigger'),
          'data-active': active ? 'true' : 'false',
          onClick: () => uiStore.set({ open: !uiStore.get().open }),
        },
        h(IconPalette, { size: wide ? 18 : 20 }),
        active ? h('span', { className: 'dsph-triggerDot' }) : null,
      );
    }

    function PersonalizationOverlay(props) {
      const t = props.t;
      const ui = useStore(uiStore);
      const pref = useStore(prefStore);
      const bold = pref.palette === 'custom' && pref.custom.bold;
      useEffect(() => {
        if (!ui.open) return undefined;
        const onPointerDown = (event) => {
          const target = event.target;
          if (target instanceof Element && (target.closest('.dsph-panel') || target.closest('[data-dsph-trigger]'))) return;
          uiStore.set({ open: false });
        };
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          uiStore.set({ open: false });
        };
        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
          document.removeEventListener('mousedown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown, true);
        };
      }, [ui.open]);
      return h(
        React.Fragment,
        null,
        h(StyleTag),
        bold ? h(BoldBorderStyles) : null,
        ui.open
          ? h(
              'div',
              { className: 'dsph-panel', role: 'dialog', 'aria-label': t('title') },
              h(
                'div',
                { className: 'dsph-head' },
                h('div', { className: 'dsph-title' }, t('title')),
                h(
                  'div',
                  { className: 'dsph-headActions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsph-reset',
                      'aria-label': t('reset'),
                      title: t('reset'),
                      onClick: resetAll,
                    },
                    h(IconReset),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsph-close',
                      'aria-label': t('close'),
                      onClick: () => uiStore.set({ open: false }),
                    },
                    h(IconClose),
                  ),
                ),
              ),
              h(PersonalizationContent, { t: t }),
            )
          : null,
      );
    }

    function PersonalizationSettingsPage(props) {
      const t = props.t;
      return h(
        'div',
        { className: 'dsph-page' },
        h(
          'div',
          { className: 'dsph-pageHead' },
          h(
            'div',
            null,
            h('div', { className: 'dsph-pageTitle' }, t('title')),
            h('div', { className: 'dsph-pageSub' }, t('subtitle')),
          ),
        ),
        h(PersonalizationContent, { t: t }),
      );
    }

    /* ------------------------------------------------------------------ */
    /* Plugin body                                                         */
    /* ------------------------------------------------------------------ */

    const inject = ['slots', 'theme', 'locale'];

    function apply(ctx) {
      const theme = ctx.theme;
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-theme: dictionaries');
      const t = ctx.locale.bind(NS);

      /* Durable preferences live in the Host settings document under this entry id. */
      const configForms = typeof ctx.get === 'function' ? ctx.get('configForms') : undefined;
      if (configForms && typeof configForms.get === 'function') {
        try {
          settingsForm = configForms.get(SETTINGS_ENTRY_ID) || null;
        } catch (error) {
          settingsForm = null;
        }
      }
      if (settingsForm) adoptHostPref();
      if (!settingsForm) hostReady = true;

      engine = {
        theme,
        layer: null,
        apply(pref) {
          const tokens = collectTokens(pref);
          if (Object.keys(tokens).length === 0) {
            if (this.layer) {
              this.layer();
              this.layer = null;
            }
            return;
          }
          this.layer = theme.overrideTokens(SOURCE, tokens);
        },
        dispose() {
          if (this.layer) {
            this.layer();
            this.layer = null;
          }
        },
      };

      engine.apply(prefStore.get());
      lastApplyAt = Date.now();

      if (settingsForm && !hostReady && hasWindowTimers()) {
        hostFallbackTimer = window.setTimeout(() => {
          hostFallbackTimer = 0;
          hostReady = true;
          if (localDirtyBeforeHost) {
            localDirtyBeforeHost = false;
            pushHostPref();
          }
        }, 2500);
      }

      ctx.effect(() => {
        const snapshot = theme.getTheme();
        const current = themeStore.get();
        if (current.text !== snapshot.fontSizes.text || current.preference !== snapshot.preference) {
          themeStore.set({ text: snapshot.fontSizes.text, preference: snapshot.preference });
        }
        const offPref = prefStore.subscribe(() => scheduleApply());
        let offSettings = function () {};
        if (settingsForm) offSettings = settingsForm.subscribe(() => adoptHostPref());
        const offTheme = ctx.on('theme/change', (next) => {
          const state = themeStore.get();
          if (state.text !== next.fontSizes.text || state.preference !== next.preference) {
            themeStore.set({ text: next.fontSizes.text, preference: next.preference });
          }
        });
        return () => {
          offPref();
          offTheme();
          offSettings();
          if (hostFallbackTimer !== 0) {
            if (hasWindowTimers()) window.clearTimeout(hostFallbackTimer);
            hostFallbackTimer = 0;
          }
          if (applyTimer !== 0) {
            if (hasWindowTimers()) window.clearTimeout(applyTimer);
            applyTimer = 0;
          }
          if (persistTimer !== 0) {
            if (hasWindowTimers()) window.clearTimeout(persistTimer);
            persistTimer = 0;
            persistPref(prefStore.get());
          }
          pushHostPref();
          engine.dispose();
        };
      }, 'dsh-theme: token layer and theme-state sync');

      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'dsh-theme',
            order: 28,
            locale: NS,
            label: () => t('trigger'),
          },
          ThemeTrigger,
        ),
      );

      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'dsh-theme',
            order: 90,
            locale: NS,
            label: () => t('title'),
          },
          PersonalizationOverlay,
        ),
      );

      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'dsh-theme',
            order: 25,
            locale: NS,
            label: () => t('section'),
          },
          PersonalizationSettingsPage,
        ),
      );
    }

    return { inject, apply };
  },
});
