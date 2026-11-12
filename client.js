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
    const PALETTES = [{"id":"warm","light":{"bgBase":"#F8F7F4","bgLayer1":"#FFFFFF","bgLayer2":"#F2F0EA","bgOverlay":"#FFFDF8","borderL1":"#E8E4DB","borderL2":"#D6D0C3","brandPrimary":"#2F6B50","labelPrimary":"#191814","labelSecondary":"#5F5A51","stateError":"#C0362C","stateIdle":"#948E82","stateSuccess":"#2E7D4F","stateWarn":"#966300","sidebarFill":"#F1EFE9"},"dark":{"bgBase":"#141413","bgLayer1":"#1D1C1A","bgLayer2":"#262421","bgOverlay":"#2C2A26","borderL1":"#302E29","borderL2":"#433F38","brandPrimary":"#3F8560","labelPrimary":"#F1EFE9","labelSecondary":"#ABA599","stateError":"#E5675C","stateIdle":"#726C61","stateSuccess":"#5DB583","stateWarn":"#D9A441","sidebarFill":"#101010"}},{"id":"mono","light":{"bgBase":"#FFFFFF","bgLayer1":"#FFFFFF","bgLayer2":"#F4F4F4","bgOverlay":"#FFFFFF","borderL1":"#E6E6E6","borderL2":"#D2D2D2","brandPrimary":"#171717","labelPrimary":"#0F0F0F","labelSecondary":"#5F5F5F","stateError":"#C62828","stateIdle":"#999999","stateSuccess":"#1E7B3C","stateWarn":"#8F6400","sidebarFill":"#F6F6F6"},"dark":{"bgBase":"#0A0A0A","bgLayer1":"#141414","bgLayer2":"#1D1D1D","bgOverlay":"#242424","borderL1":"#2A2A2A","borderL2":"#414141","brandPrimary":"#EDEDED","labelPrimary":"#FAFAFA","labelSecondary":"#A6A6A6","stateError":"#F26D6D","stateIdle":"#6B6B6B","stateSuccess":"#46B96B","stateWarn":"#CFA33F","sidebarFill":"#111111"}},{"id":"claude","light":{"bgBase":"#FAF8F1","bgLayer1":"#FEFDF9","bgLayer2":"#F2EFE5","bgOverlay":"#FFFEFA","borderL1":"#E5E1D4","borderL2":"#D2CCBC","brandPrimary":"#BB5A38","labelPrimary":"#3A3428","labelSecondary":"#6E6759","stateError":"#B23A2C","stateIdle":"#97907F","stateSuccess":"#3F7A51","stateWarn":"#9A6407","sidebarFill":"#F4F1E7"},"dark":{"bgBase":"#1F1E1B","bgLayer1":"#272622","bgLayer2":"#302E28","bgOverlay":"#35332C","borderL1":"#3B3833","borderL2":"#4E4A42","brandPrimary":"#BF6035","labelPrimary":"#F1EBDF","labelSecondary":"#B6AD9F","stateError":"#E8786A","stateIdle":"#8B8477","stateSuccess":"#6FB284","stateWarn":"#D9A54B","sidebarFill":"#1A1917"}},{"id":"claude-plus","light":{"bgBase":"#F2EEE3","bgLayer1":"#FBF8F0","bgLayer2":"#E9E4D6","bgOverlay":"#FFFCF5","borderL1":"#DCD5C4","borderL2":"#C7BEAA","brandPrimary":"#A33F1F","labelPrimary":"#211E17","labelSecondary":"#5B5447","stateError":"#9E2F22","stateIdle":"#8C8574","stateSuccess":"#2F6B43","stateWarn":"#8A5A00","sidebarFill":"#ECE7DA"},"dark":{"bgBase":"#161513","bgLayer1":"#1F1E1A","bgLayer2":"#292722","bgOverlay":"#2C2924","borderL1":"#35322D","borderL2":"#474339","brandPrimary":"#C5512B","labelPrimary":"#FBF6EC","labelSecondary":"#B9B1A2","stateError":"#EC7565","stateIdle":"#8A8376","stateSuccess":"#64AC7C","stateWarn":"#D8A344","sidebarFill":"#111110"}},{"id":"vermillion","light":{"bgBase":"#FAF7F3","bgLayer1":"#FFFDF9","bgLayer2":"#F3EEE7","bgOverlay":"#FFFFFF","borderL1":"#E7E0D6","borderL2":"#D5CBBE","brandPrimary":"#C63D22","labelPrimary":"#1E1B18","labelSecondary":"#635C52","stateError":"#B32F24","stateIdle":"#9C9488","stateSuccess":"#37754A","stateWarn":"#9A6203","sidebarFill":"#F4F0E9"},"dark":{"bgBase":"#171412","bgLayer1":"#201C19","bgLayer2":"#292420","bgOverlay":"#302A25","borderL1":"#36302B","borderL2":"#48403A","brandPrimary":"#D2492D","labelPrimary":"#F4EDE6","labelSecondary":"#B4A99B","stateError":"#EF6C5C","stateIdle":"#8A8175","stateSuccess":"#62AE7F","stateWarn":"#D7A03F","sidebarFill":"#120F0D"}},{"id":"amber-mono","light":{"bgBase":"#FAF9F6","bgLayer1":"#FFFFFF","bgLayer2":"#F3F1EC","bgOverlay":"#FFFEFB","borderL1":"#E6E2D9","borderL2":"#D3CDC0","brandPrimary":"#A16800","labelPrimary":"#1F1C16","labelSecondary":"#645D50","stateError":"#B03A2E","stateIdle":"#9A9284","stateSuccess":"#4A7A46","stateWarn":"#8A6100","sidebarFill":"#F2EFE8"},"dark":{"bgBase":"#191713","bgLayer1":"#221F1A","bgLayer2":"#2B2721","bgOverlay":"#322D26","borderL1":"#363129","borderL2":"#48423A","brandPrimary":"#A06B00","labelPrimary":"#F3EEE4","labelSecondary":"#B8AE9D","stateError":"#E97463","stateIdle":"#8C8476","stateSuccess":"#63AE7B","stateWarn":"#D9A63C","sidebarFill":"#131110"}},{"id":"mx-brutalist","light":{"bgBase":"#FFFFFF","bgLayer1":"#FFFFFF","bgLayer2":"#F2F2F2","bgOverlay":"#FFFFFF","borderL1":"#171717","borderL2":"#000000","brandPrimary":"#1732E0","labelPrimary":"#000000","labelSecondary":"#3A3A3A","stateError":"#D50000","stateIdle":"#6E6E6E","stateSuccess":"#00702F","stateWarn":"#7A5A00","sidebarFill":"#F7F7F7"},"dark":{"bgBase":"#000000","bgLayer1":"#0B0B0B","bgLayer2":"#161616","bgOverlay":"#1D1D1D","borderL1":"#3B3B3B","borderL2":"#E8E8E8","brandPrimary":"#3A5BFF","labelPrimary":"#FFFFFF","labelSecondary":"#AFAFAF","stateError":"#FF3B30","stateIdle":"#8A8A8A","stateSuccess":"#2BD964","stateWarn":"#FFD60A","sidebarFill":"#0B0B0B"}},{"id":"tiesen","light":{"bgBase":"#F6F8F9","bgLayer1":"#FFFFFF","bgLayer2":"#EDF1F2","bgOverlay":"#FFFFFF","borderL1":"#E0E6E7","borderL2":"#C9D3D5","brandPrimary":"#2E6B6E","labelPrimary":"#15242A","labelSecondary":"#56676D","stateError":"#B23F39","stateIdle":"#849699","stateSuccess":"#2C7A55","stateWarn":"#94660D","sidebarFill":"#EEF2F3"},"dark":{"bgBase":"#0F1618","bgLayer1":"#172023","bgLayer2":"#1F2A2D","bgOverlay":"#243034","borderL1":"#253337","borderL2":"#33464A","brandPrimary":"#3E8B86","labelPrimary":"#E7EFEF","labelSecondary":"#9DAFB2","stateError":"#E27C74","stateIdle":"#6C7E82","stateSuccess":"#58B98F","stateWarn":"#D5A24A","sidebarFill":"#0B1113"}},{"id":"vescrow","light":{"bgBase":"#FDFCFE","bgLayer1":"#FFFFFF","bgLayer2":"#F3F1F6","bgOverlay":"#FFFFFF","borderL1":"#E6E1E9","borderL2":"#D3CCDA","brandPrimary":"#1F2A6E","labelPrimary":"#14101C","labelSecondary":"#635D69","stateError":"#C22B2B","stateIdle":"#9A93A0","stateSuccess":"#2F7D5B","stateWarn":"#96680F","sidebarFill":"#F4F2F8"},"dark":{"bgBase":"#07080F","bgLayer1":"#0C0F1A","bgLayer2":"#121627","bgOverlay":"#171B30","borderL1":"#1E2340","borderL2":"#2C3358","brandPrimary":"#4C5BD9","labelPrimary":"#F6F4FA","labelSecondary":"#A29EAF","stateError":"#EC6A61","stateIdle":"#6A6578","stateSuccess":"#58B98A","stateWarn":"#D6A447","sidebarFill":"#090B16"}},{"id":"catppuccin","light":{"bgBase":"#EFF1F5","bgLayer1":"#FFFFFF","bgLayer2":"#E6E9EF","bgOverlay":"#FFFFFF","borderL1":"#DCE0E8","borderL2":"#CCD0DA","brandPrimary":"#1E66F5","labelPrimary":"#313344","labelSecondary":"#64677B","stateError":"#D20F39","stateIdle":"#8C8FA1","stateSuccess":"#307522","stateWarn":"#966017","sidebarFill":"#E6E9EF"},"dark":{"bgBase":"#1E1E2E","bgLayer1":"#313244","bgLayer2":"#45475A","bgOverlay":"#45475A","borderL1":"#313244","borderL2":"#585B70","brandPrimary":"#89B4FA","labelPrimary":"#CDD6F4","labelSecondary":"#A6ADC8","stateError":"#F38BA8","stateIdle":"#6C7086","stateSuccess":"#A6E3A1","stateWarn":"#F9E2AF","sidebarFill":"#181825"}},{"id":"nord","light":{"bgBase":"#ECEFF4","bgLayer1":"#E5E9F0","bgLayer2":"#D8DEE9","bgOverlay":"#E5E9F0","borderL1":"#D8DEE9","borderL2":"#C2CBD9","brandPrimary":"#5E81AC","labelPrimary":"#2E3440","labelSecondary":"#4C566A","stateError":"#A3535B","stateIdle":"#7B88A1","stateSuccess":"#5E6E53","stateWarn":"#746447","sidebarFill":"#E5E9F0"},"dark":{"bgBase":"#2E3440","bgLayer1":"#3B4252","bgLayer2":"#434C5E","bgOverlay":"#434C5E","borderL1":"#434C5E","borderL2":"#4C566A","brandPrimary":"#88C0D0","labelPrimary":"#ECEFF4","labelSecondary":"#D8DEE9","stateError":"#D08B90","stateIdle":"#4C566A","stateSuccess":"#A3BE8C","stateWarn":"#EBCB8B","sidebarFill":"#272C36"}},{"id":"gruvbox","light":{"bgBase":"#FBF1C7","bgLayer1":"#F2E5BC","bgLayer2":"#EBDBB2","bgOverlay":"#F2E5BC","borderL1":"#D5C4A1","borderL2":"#BDAE93","brandPrimary":"#AF3A03","labelPrimary":"#3C3836","labelSecondary":"#73675D","stateError":"#CC241D","stateIdle":"#A89984","stateSuccess":"#6E6E16","stateWarn":"#855F18","sidebarFill":"#F2E5BC"},"dark":{"bgBase":"#282828","bgLayer1":"#3C3836","bgLayer2":"#504945","bgOverlay":"#3C3836","borderL1":"#504945","borderL2":"#665C54","brandPrimary":"#FABD2F","labelPrimary":"#EBDBB2","labelSecondary":"#A89984","stateError":"#FB5743","stateIdle":"#928374","stateSuccess":"#B8BB26","stateWarn":"#FABD2F","sidebarFill":"#1D2021"}},{"id":"tokyo-night","light":{"bgBase":"#E1E2E7","bgLayer1":"#D0D5E3","bgLayer2":"#C4C8DA","bgOverlay":"#D0D5E3","borderL1":"#C4C8DA","borderL2":"#B6BBD0","brandPrimary":"#2E7DE9","labelPrimary":"#1B2B53","labelSecondary":"#4D5B8C","stateError":"#B2214B","stateIdle":"#7B87A8","stateSuccess":"#526C35","stateWarn":"#775D36","sidebarFill":"#D0D5E3"},"dark":{"bgBase":"#1A1B26","bgLayer1":"#292E42","bgLayer2":"#3B4261","bgOverlay":"#292E42","borderL1":"#3B4261","borderL2":"#414868","brandPrimary":"#7AA2F7","labelPrimary":"#C0CAF5","labelSecondary":"#A9B1D6","stateError":"#F7768E","stateIdle":"#565F89","stateSuccess":"#9ECE6A","stateWarn":"#E0AF68","sidebarFill":"#16161E"}}];

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

    /** Per-mode DIY color slots shown in the editor. */
    const CUSTOM_FIELDS = ['bg', 'layer', 'overlay', 'sidebar', 'label', 'border', 'accent'];
    /** Additional per-mode anchors preserved when a preset is cloned as a base. */
    const CUSTOM_EXTRA_KEYS = ['layer2', 'border1', 'label2', 'idle', 'error', 'success', 'warn'];

    /* ------------------------------------------------------------------ */
    /* Locale dictionaries                                                 */
    /* ------------------------------------------------------------------ */

    const zh = {
      'trigger': '个性化主题',
      'title': '个性化',
      'subtitle': '主题配色、字体与界面字号',
      'close': '关闭',
      'section': '主题',
      'appearance': '明暗',
      'mode.system': '跟随系统',
      'mode.light': '浅色',
      'mode.dark': '深色',
      'themeTitle': '主题色',
      'theme.import': '导入主题 JSON',
      'theme.hint': '从预设开始，或导入主题 JSON，再点「自定义」继续调整。',
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
      'theme.catppuccin': 'Catppuccin',
      'theme.nord': 'Nord',
      'theme.gruvbox': 'Gruvbox',
      'theme.tokyo-night': 'Tokyo Night',
      'theme.custom': '自定义',
      'customTitle': '自定义主题',
      'back': '返回',
      'boldBorders': '加粗边框',
      'states': '状态色',
      'custom.namePlaceholder': '主题名称',
      'custom.nameRequired': '请先给主题命名',
      'custom.save': '保存',
      'custom.delete': '删除',
      'custom.basePlaceholder': '选择基底主题',
      'custom.baseLabel': '基底主题',
      'custom.savedPlaceholder': '选择已保存主题',
      'custom.importedName': '导入的主题',
      'custom.example': '示例',
      'custom.fromFile': '从文件导入',
      'custom.exampleName': '主题名称，可自定义',
      'custom.exampleBg': '背景色',
      'custom.exampleAccent': '强调色',
      'custom.exampleHint': '支持 light / dark 两套颜色，其余字段可省略',
      'font.showLocal': '本机字体',
      'custom.export': '导出',
      'custom.import': '导入',
      'custom.exportPrompt': '复制这段主题 JSON',
      'custom.importPrompt': '粘贴主题 JSON',
      'custom.importFailed': '导入失败：这段 JSON 无效',
      'custom.savedTitle': '我的主题',
      'custom.manage': '管理',
      'custom.done': '完成',
      'custom.cancel': '取消',
      'custom.importConfirm': '导入',
      'custom.importPlaceholder': '粘贴主题 JSON',
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
      'font.latin.custom': '自定义…',
      'font.cjk.custom': '自定义…',
      'code.custom': '自定义…',
      'font.customPlaceholder': '如 "Microsoft YaHei", "Noto Sans SC"',
      'font.detect': '检测本机字体',
      'font.detected': '已检测到本机字体，可从输入框的下拉列表选择',
      'font.detectUnsupported': '当前环境不支持自动检测，直接输入字体名即可',
      'font.detectFailed': '检测失败，直接输入字体名即可',
      'font.localPrefix': '本机 · ',
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
      'section': 'Theme',
      'appearance': 'Appearance',
      'mode.system': 'System',
      'mode.light': 'Light',
      'mode.dark': 'Dark',
      'themeTitle': 'Theme color',
      'theme.import': 'Import theme JSON',
      'theme.hint': 'Start from a preset, or import theme JSON, then open Custom to adjust it.',
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
      'theme.catppuccin': 'Catppuccin',
      'theme.nord': 'Nord',
      'theme.gruvbox': 'Gruvbox',
      'theme.tokyo-night': 'Tokyo Night',
      'theme.custom': 'Custom',
      'customTitle': 'Custom theme',
      'back': 'Back',
      'boldBorders': 'Bold borders',
      'states': 'Status colors',
      'custom.namePlaceholder': 'Theme name',
      'custom.nameRequired': 'Name the theme before saving',
      'custom.save': 'Save',
      'custom.delete': 'Delete',
      'custom.basePlaceholder': 'Start from a preset',
      'custom.baseLabel': 'Base theme',
      'custom.savedPlaceholder': 'Load a saved theme',
      'custom.importedName': 'Imported theme',
      'custom.example': 'Example',
      'custom.fromFile': 'Import from file',
      'custom.exampleName': 'theme name, yours to choose',
      'custom.exampleBg': 'background',
      'custom.exampleAccent': 'accent',
      'custom.exampleHint': 'light / dark pairs are supported; other fields are optional',
      'font.showLocal': 'Local fonts',
      'custom.export': 'Export',
      'custom.import': 'Import',
      'custom.exportPrompt': 'Copy this theme JSON',
      'custom.importPrompt': 'Paste theme JSON',
      'custom.importFailed': 'Import failed: invalid theme JSON',
      'custom.savedTitle': 'My themes',
      'custom.manage': 'Manage',
      'custom.done': 'Done',
      'custom.cancel': 'Cancel',
      'custom.importConfirm': 'Import',
      'custom.importPlaceholder': 'Paste theme JSON',
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
      'font.latin.custom': 'Custom…',
      'font.cjk.custom': 'Custom…',
      'code.custom': 'Custom…',
      'font.customPlaceholder': 'e.g. "Microsoft YaHei", "Noto Sans SC"',
      'font.detect': 'Detect local fonts',
      'font.detected': 'Local fonts detected; pick one from the input suggestions',
      'font.detectUnsupported': 'Automatic detection is unavailable here; type the font name',
      'font.detectFailed': 'Detection failed; type the font name instead',
      'font.localPrefix': 'Local · ',
      'code.default': 'System default',
      'code.cascadia': 'Cascadia Code',
      'code.jetbrains': 'JetBrains Mono',
      'code.fira': 'Fira Code',
      'code.sf-mono': 'SF Mono',
      'code.sarasa': 'Sarasa Mono SC',
    };

    /* Additional shipped locales inherit every remaining label from English. */
    const ja = Object.assign({}, en, {
      'trigger': 'テーマのカスタマイズ',
      'title': 'パーソナライズ',
      'subtitle': 'テーマ配色・フォント・文字サイズ',
      'close': '閉じる',
      'section': 'テーマ',
      'appearance': '外観',
      'mode.system': 'システム',
      'mode.light': 'ライト',
      'mode.dark': 'ダーク',
      'themeTitle': 'テーマカラー',
      'theme.import': 'テーマ JSON を読み込む',
      'theme.hint': 'プリセットから始めるか、テーマ JSON を読み込んで「カスタム」で調整します。',
      'fontsTitle': 'フォント',
      'latin': '英字',
      'cjk': '中国語',
      'codeFont': 'コードフォント',
      'fontSize': '文字サイズ',
      'reset': 'リセット',
      'theme.none': 'デフォルト',
      'theme.custom': 'カスタム',
      'customTitle': 'カスタムテーマ',
      'back': '戻る',
      'boldBorders': '枠線を太く',
      'states': 'ステータス色',
      'custom.namePlaceholder': 'テーマ名',
      'custom.nameRequired': '保存する前にテーマ名を入力してください',
      'custom.save': '保存',
      'custom.delete': '削除',
      'custom.basePlaceholder': 'プリセットから開始',
      'custom.baseLabel': 'ベーステーマ',
      'custom.savedPlaceholder': '保存済みテーマを読み込む',
      'custom.importedName': '読み込んだテーマ',
      'custom.example': '例',
      'custom.fromFile': 'ファイルから読み込む',
      'custom.exampleName': 'テーマ名（自由に設定）',
      'custom.exampleBg': '背景',
      'custom.exampleAccent': 'アクセント',
      'custom.exampleHint': 'light / dark の組み合わせに対応。ほかの項目は省略できます',
      'font.showLocal': 'ローカルフォント',
      'custom.export': 'エクスポート',
      'custom.import': 'インポート',
      'custom.importPrompt': 'テーマ JSON を貼り付け',
      'custom.importFailed': 'インポート失敗：JSON が正しくありません',
      'custom.savedTitle': 'マイテーマ',
      'custom.manage': '管理',
      'custom.done': '完了',
      'custom.cancel': 'キャンセル',
      'custom.importConfirm': 'インポート',
      'custom.importPlaceholder': 'テーマ JSON を貼り付け',
      'color.bg': '背景',
      'color.layer': 'カード',
      'color.overlay': 'ポップオーバー',
      'color.sidebar': 'サイドバー',
      'color.label': 'テキスト',
      'color.border': '枠線',
      'color.accent': 'アクセント',
      'color.error': 'エラー',
      'color.success': '成功',
      'color.warn': '警告',
      'font.detect': 'ローカルフォントを検出',
      'font.detected': 'ローカルフォントを検出しました。入力候補から選択できます',
      'font.detectUnsupported': 'この環境では自動検出できません。フォント名を入力してください',
      'font.detectFailed': '検出に失敗しました。フォント名を入力してください',
      'font.localPrefix': 'ローカル · ',
      'font.latin.system': 'システム',
      'font.latin.humanist': 'ヒューマニスト',
      'font.latin.serif': 'セリフ',
      'font.latin.rounded': '丸ゴシック',
      'font.latin.mono': '等幅',
      'font.latin.kai': 'パラティーノ',
      'font.cjk.system': 'システム',
      'font.cjk.yahei': '雅黒',
      'font.cjk.source-han': '思源黒体',
      'font.cjk.serif': '思源宋体',
      'font.cjk.kai': '霞鶩文楷',
      'font.cjk.mono': '等幅',
      'font.cjk.rounded': '丸ゴシック',
      'code.default': 'システム標準',
    });

    const es = Object.assign({}, en, {
      'trigger': 'Tema de personalización',
      'title': 'Personalización',
      'subtitle': 'Paleta de tema, fuentes y tamaño del texto',
      'close': 'Cerrar',
      'section': 'Tema',
      'appearance': 'Apariencia',
      'mode.system': 'Sistema',
      'mode.light': 'Claro',
      'mode.dark': 'Oscuro',
      'themeTitle': 'Color del tema',
      'theme.import': 'Importar tema JSON',
      'theme.hint': 'Empieza con un preajuste o importa un tema JSON; luego abre Personalizado para ajustarlo.',
      'fontsTitle': 'Fuentes',
      'latin': 'Latina',
      'cjk': 'China',
      'codeFont': 'Fuente de código',
      'fontSize': 'Tamaño del texto',
      'reset': 'Restablecer',
      'theme.none': 'Predeterminado',
      'theme.custom': 'Personalizado',
      'customTitle': 'Tema personalizado',
      'back': 'Atrás',
      'boldBorders': 'Bordes gruesos',
      'states': 'Colores de estado',
      'custom.namePlaceholder': 'Nombre del tema',
      'custom.nameRequired': 'Ponle un nombre al tema antes de guardar',
      'custom.save': 'Guardar',
      'custom.delete': 'Eliminar',
      'custom.basePlaceholder': 'Empezar desde un preajuste',
      'custom.baseLabel': 'Tema base',
      'custom.savedPlaceholder': 'Cargar un tema guardado',
      'custom.importedName': 'Tema importado',
      'custom.example': 'Ejemplo',
      'custom.fromFile': 'Importar desde archivo',
      'custom.exampleName': 'nombre del tema, a tu elección',
      'custom.exampleBg': 'fondo',
      'custom.exampleAccent': 'acento',
      'custom.exampleHint': 'se admiten pares claro/oscuro; los demás campos son opcionales',
      'font.showLocal': 'Fuentes locales',
      'custom.export': 'Exportar',
      'custom.import': 'Importar',
      'custom.importPrompt': 'Pega el JSON del tema',
      'custom.importFailed': 'Error al importar: JSON no válido',
      'custom.savedTitle': 'Mis temas',
      'custom.manage': 'Gestionar',
      'custom.done': 'Listo',
      'custom.cancel': 'Cancelar',
      'custom.importConfirm': 'Importar',
      'custom.importPlaceholder': 'Pega el JSON del tema',
      'color.bg': 'Fondo',
      'color.layer': 'Tarjeta',
      'color.overlay': 'Emergente',
      'color.sidebar': 'Barra lateral',
      'color.label': 'Texto',
      'color.border': 'Borde',
      'color.accent': 'Acento',
      'color.error': 'Error',
      'color.success': 'Éxito',
      'color.warn': 'Advertencia',
      'font.detect': 'Detectar fuentes locales',
      'font.detected': 'Fuentes locales detectadas; elige una en las sugerencias',
      'font.detectUnsupported': 'La detección automática no está disponible; escribe el nombre de la fuente',
      'font.detectFailed': 'La detección falló; escribe el nombre de la fuente',
      'font.localPrefix': 'Local · ',
      'font.latin.system': 'Sistema',
      'font.latin.humanist': 'Humanista',
      'font.latin.serif': 'Serif',
      'font.latin.rounded': 'Redondeada',
      'font.latin.mono': 'Monoespaciada',
      'font.latin.kai': 'Palatino',
      'font.cjk.system': 'Sistema',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Mono',
      'font.cjk.rounded': 'Redondeada',
      'code.default': 'Predeterminada del sistema',
    });

    const fr = Object.assign({}, en, {
      'trigger': 'Thème de personnalisation',
      'title': 'Personnalisation',
      'subtitle': 'Palette de thème, polices et taille du texte',
      'close': 'Fermer',
      'section': 'Thème',
      'appearance': 'Apparence',
      'mode.system': 'Système',
      'mode.light': 'Clair',
      'mode.dark': 'Sombre',
      'themeTitle': 'Couleur du thème',
      'theme.import': 'Importer un thème JSON',
      'theme.hint': 'Partez d’un préréglage ou importez un thème JSON, puis ouvrez Personnalisé pour l’ajuster.',
      'fontsTitle': 'Polices',
      'latin': 'Latine',
      'cjk': 'Chinoise',
      'codeFont': 'Police de code',
      'fontSize': 'Taille du texte',
      'reset': 'Réinitialiser',
      'theme.none': 'Par défaut',
      'theme.custom': 'Personnalisé',
      'customTitle': 'Thème personnalisé',
      'back': 'Retour',
      'boldBorders': 'Bordures épaisses',
      'states': 'Couleurs d’état',
      'custom.namePlaceholder': 'Nom du thème',
      'custom.nameRequired': 'Donnez un nom au thème avant d’enregistrer',
      'custom.save': 'Enregistrer',
      'custom.delete': 'Supprimer',
      'custom.basePlaceholder': 'Partir d’un préréglage',
      'custom.baseLabel': 'Thème de base',
      'custom.savedPlaceholder': 'Charger un thème enregistré',
      'custom.importedName': 'Thème importé',
      'custom.example': 'Exemple',
      'custom.fromFile': 'Importer depuis un fichier',
      'custom.exampleName': 'nom du thème, à votre choix',
      'custom.exampleBg': 'fond',
      'custom.exampleAccent': 'accent',
      'custom.exampleHint': 'les paires clair/sombre sont prises en charge ; les autres champs sont facultatifs',
      'font.showLocal': 'Polices locales',
      'custom.export': 'Exporter',
      'custom.import': 'Importer',
      'custom.importPrompt': 'Collez le JSON du thème',
      'custom.importFailed': 'Échec de l’import : JSON invalide',
      'custom.savedTitle': 'Mes thèmes',
      'custom.manage': 'Gérer',
      'custom.done': 'Terminé',
      'custom.cancel': 'Annuler',
      'custom.importConfirm': 'Importer',
      'custom.importPlaceholder': 'Collez le JSON du thème',
      'color.bg': 'Fond',
      'color.layer': 'Carte',
      'color.overlay': 'Fenêtre',
      'color.sidebar': 'Barre latérale',
      'color.label': 'Texte',
      'color.border': 'Bordure',
      'color.accent': 'Accent',
      'color.error': 'Erreur',
      'color.success': 'Succès',
      'color.warn': 'Avertissement',
      'font.detect': 'Détecter les polices locales',
      'font.detected': 'Polices locales détectées ; choisissez-en une dans les suggestions',
      'font.detectUnsupported': 'La détection automatique est indisponible ; saisissez le nom de la police',
      'font.detectFailed': 'La détection a échoué ; saisissez le nom de la police',
      'font.localPrefix': 'Locale · ',
      'font.latin.system': 'Système',
      'font.latin.humanist': 'Humaniste',
      'font.latin.serif': 'Serif',
      'font.latin.rounded': 'Arrondie',
      'font.latin.mono': 'Chasse fixe',
      'font.latin.kai': 'Palatino',
      'font.cjk.system': 'Système',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Chasse fixe',
      'font.cjk.rounded': 'Arrondie',
      'code.default': 'Système par défaut',
    });

    const de = Object.assign({}, en, {
      'trigger': 'Personalisierungs-Theme',
      'title': 'Personalisierung',
      'subtitle': 'Farbpalette, Schriften und Textgröße',
      'close': 'Schließen',
      'section': 'Theme',
      'appearance': 'Erscheinungsbild',
      'mode.system': 'System',
      'mode.light': 'Hell',
      'mode.dark': 'Dunkel',
      'themeTitle': 'Themenfarbe',
      'theme.import': 'Theme-JSON importieren',
      'theme.hint': 'Mit einer Voreinstellung beginnen oder Theme-JSON importieren, dann unter „Benutzerdefiniert“ anpassen.',
      'fontsTitle': 'Schriften',
      'latin': 'Lateinisch',
      'cjk': 'Chinesisch',
      'codeFont': 'Codeschrift',
      'fontSize': 'Textgröße',
      'reset': 'Zurücksetzen',
      'theme.none': 'Standard',
      'theme.custom': 'Benutzerdefiniert',
      'customTitle': 'Benutzerdefiniertes Theme',
      'back': 'Zurück',
      'boldBorders': 'Kräftige Rahmen',
      'states': 'Statusfarben',
      'custom.namePlaceholder': 'Theme-Name',
      'custom.nameRequired': 'Bitte vor dem Speichern einen Namen vergeben',
      'custom.save': 'Speichern',
      'custom.delete': 'Löschen',
      'custom.basePlaceholder': 'Mit einer Voreinstellung beginnen',
      'custom.baseLabel': 'Basis-Theme',
      'custom.savedPlaceholder': 'Gespeichertes Theme laden',
      'custom.importedName': 'Importiertes Theme',
      'custom.example': 'Beispiel',
      'custom.fromFile': 'Aus Datei importieren',
      'custom.exampleName': 'Theme-Name, frei wählbar',
      'custom.exampleBg': 'Hintergrund',
      'custom.exampleAccent': 'Akzent',
      'custom.exampleHint': 'Hell/Dunkel-Paare werden unterstützt; weitere Felder sind optional',
      'font.showLocal': 'Lokale Schriften',
      'custom.export': 'Exportieren',
      'custom.import': 'Importieren',
      'custom.importPrompt': 'Theme-JSON einfügen',
      'custom.importFailed': 'Import fehlgeschlagen: ungültiges JSON',
      'custom.savedTitle': 'Meine Themes',
      'custom.manage': 'Verwalten',
      'custom.done': 'Fertig',
      'custom.cancel': 'Abbrechen',
      'custom.importConfirm': 'Importieren',
      'custom.importPlaceholder': 'Theme-JSON einfügen',
      'color.bg': 'Hintergrund',
      'color.layer': 'Karte',
      'color.overlay': 'Overlay',
      'color.sidebar': 'Seitenleiste',
      'color.label': 'Text',
      'color.border': 'Rahmen',
      'color.accent': 'Akzent',
      'color.error': 'Fehler',
      'color.success': 'Erfolg',
      'color.warn': 'Warnung',
      'font.detect': 'Lokale Schriften erkennen',
      'font.detected': 'Lokale Schriften erkannt; wähle eine aus den Vorschlägen',
      'font.detectUnsupported': 'Automatische Erkennung ist hier nicht verfügbar; Schriftnamen eingeben',
      'font.detectFailed': 'Erkennung fehlgeschlagen; Schriftnamen eingeben',
      'font.localPrefix': 'Lokal · ',
      'font.latin.system': 'System',
      'font.latin.humanist': 'Humanistisch',
      'font.latin.serif': 'Serif',
      'font.latin.rounded': 'Rund',
      'font.latin.mono': 'Monospace',
      'font.latin.kai': 'Palatino',
      'font.cjk.system': 'System',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Monospace',
      'font.cjk.rounded': 'Rund',
      'code.default': 'Systemstandard',
    });

    const ru = Object.assign({}, en, {
      'trigger': 'Тема оформления',
      'title': 'Персонализация',
      'subtitle': 'Палитра, шрифты и размер текста',
      'close': 'Закрыть',
      'section': 'Тема',
      'appearance': 'Оформление',
      'mode.system': 'Системная',
      'mode.light': 'Светлая',
      'mode.dark': 'Тёмная',
      'themeTitle': 'Цвет темы',
      'theme.import': 'Импортировать JSON темы',
      'theme.hint': 'Начните с пресета или импортируйте JSON темы, затем откройте «Своя тема» для настройки.',
      'fontsTitle': 'Шрифты',
      'latin': 'Латиница',
      'cjk': 'Китайский',
      'codeFont': 'Шрифт кода',
      'fontSize': 'Размер текста',
      'reset': 'Сбросить',
      'theme.none': 'По умолчанию',
      'theme.custom': 'Своя тема',
      'customTitle': 'Своя тема',
      'back': 'Назад',
      'boldBorders': 'Жирные границы',
      'states': 'Цвета состояний',
      'custom.namePlaceholder': 'Название темы',
      'custom.nameRequired': 'Введите название темы перед сохранением',
      'custom.save': 'Сохранить',
      'custom.delete': 'Удалить',
      'custom.basePlaceholder': 'Начать с пресета',
      'custom.baseLabel': 'Базовая тема',
      'custom.savedPlaceholder': 'Загрузить сохранённую тему',
      'custom.importedName': 'Импортированная тема',
      'custom.example': 'Пример',
      'custom.fromFile': 'Импорт из файла',
      'custom.exampleName': 'название темы, на ваш выбор',
      'custom.exampleBg': 'фон',
      'custom.exampleAccent': 'акцент',
      'custom.exampleHint': 'поддерживаются пары светлая/тёмная; остальные поля необязательны',
      'font.showLocal': 'Локальные шрифты',
      'custom.export': 'Экспорт',
      'custom.import': 'Импорт',
      'custom.importPrompt': 'Вставьте JSON темы',
      'custom.importFailed': 'Ошибка импорта: неверный JSON',
      'custom.savedTitle': 'Мои темы',
      'custom.manage': 'Управление',
      'custom.done': 'Готово',
      'custom.cancel': 'Отмена',
      'custom.importConfirm': 'Импорт',
      'custom.importPlaceholder': 'Вставьте JSON темы',
      'color.bg': 'Фон',
      'color.layer': 'Карточка',
      'color.overlay': 'Всплывающее окно',
      'color.sidebar': 'Боковая панель',
      'color.label': 'Текст',
      'color.border': 'Граница',
      'color.accent': 'Акцент',
      'color.error': 'Ошибка',
      'color.success': 'Успех',
      'color.warn': 'Предупреждение',
      'font.detect': 'Найти локальные шрифты',
      'font.detected': 'Локальные шрифты найдены; выберите один из подсказок',
      'font.detectUnsupported': 'Автоопределение недоступно; введите название шрифта',
      'font.detectFailed': 'Не удалось определить; введите название шрифта',
      'font.localPrefix': 'Локальный · ',
      'font.latin.system': 'Системный',
      'font.latin.humanist': 'Гуманистический',
      'font.latin.serif': 'С засечками',
      'font.latin.rounded': 'Округлый',
      'font.latin.mono': 'Моноширинный',
      'font.latin.kai': 'Палатино',
      'font.cjk.system': 'Системный',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Моноширинный',
      'font.cjk.rounded': 'Округлый',
      'code.default': 'Системный по умолчанию',
    });

    const pt = Object.assign({}, en, {
      'trigger': 'Tema de personalização',
      'title': 'Personalização',
      'subtitle': 'Paleta do tema, fontes e tamanho do texto',
      'close': 'Fechar',
      'section': 'Tema',
      'appearance': 'Aparência',
      'mode.system': 'Sistema',
      'mode.light': 'Claro',
      'mode.dark': 'Escuro',
      'themeTitle': 'Cor do tema',
      'theme.import': 'Importar tema JSON',
      'theme.hint': 'Comece com um preset ou importe um tema JSON; depois abra Personalizado para ajustar.',
      'fontsTitle': 'Fontes',
      'latin': 'Latina',
      'cjk': 'Chinesa',
      'codeFont': 'Fonte de código',
      'fontSize': 'Tamanho do texto',
      'reset': 'Redefinir',
      'theme.none': 'Padrão',
      'theme.custom': 'Personalizado',
      'customTitle': 'Tema personalizado',
      'back': 'Voltar',
      'boldBorders': 'Bordas grossas',
      'states': 'Cores de status',
      'custom.namePlaceholder': 'Nome do tema',
      'custom.nameRequired': 'Dê um nome ao tema antes de salvar',
      'custom.save': 'Salvar',
      'custom.delete': 'Excluir',
      'custom.basePlaceholder': 'Começar com um preset',
      'custom.baseLabel': 'Tema base',
      'custom.savedPlaceholder': 'Carregar um tema salvo',
      'custom.importedName': 'Tema importado',
      'custom.example': 'Exemplo',
      'custom.fromFile': 'Importar de arquivo',
      'custom.exampleName': 'nome do tema, você escolhe',
      'custom.exampleBg': 'fundo',
      'custom.exampleAccent': 'destaque',
      'custom.exampleHint': 'pares claro/escuro são suportados; os outros campos são opcionais',
      'font.showLocal': 'Fontes locais',
      'custom.export': 'Exportar',
      'custom.import': 'Importar',
      'custom.importPrompt': 'Cole o JSON do tema',
      'custom.importFailed': 'Falha na importação: JSON inválido',
      'custom.savedTitle': 'Meus temas',
      'custom.manage': 'Gerenciar',
      'custom.done': 'Concluído',
      'custom.cancel': 'Cancelar',
      'custom.importConfirm': 'Importar',
      'custom.importPlaceholder': 'Cole o JSON do tema',
      'color.bg': 'Fundo',
      'color.layer': 'Cartão',
      'color.overlay': 'Popover',
      'color.sidebar': 'Barra lateral',
      'color.label': 'Texto',
      'color.border': 'Borda',
      'color.accent': 'Destaque',
      'color.error': 'Erro',
      'color.success': 'Sucesso',
      'color.warn': 'Aviso',
      'font.detect': 'Detectar fontes locais',
      'font.detected': 'Fontes locais detectadas; escolha uma nas sugestões',
      'font.detectUnsupported': 'A detecção automática não está disponível; digite o nome da fonte',
      'font.detectFailed': 'A detecção falhou; digite o nome da fonte',
      'font.localPrefix': 'Local · ',
      'font.latin.system': 'Sistema',
      'font.latin.humanist': 'Humanista',
      'font.latin.serif': 'Serifada',
      'font.latin.rounded': 'Arredondada',
      'font.latin.mono': 'Monoespaçada',
      'font.latin.kai': 'Palatino',
      'font.cjk.system': 'Sistema',
      'font.cjk.yahei': 'YaHei',
      'font.cjk.source-han': 'Source Han Sans',
      'font.cjk.serif': 'Serif Song',
      'font.cjk.kai': 'WenKai',
      'font.cjk.mono': 'Monoespaçada',
      'font.cjk.rounded': 'Arredondada',
      'code.default': 'Padrão do sistema',
    });

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
      const label2 = extra.label2 ? ensureContrast(extra.label2, background, 4.5) : ensureContrast(mix(label, background, 0.42), background, 4.5);
      const brand = ensureContrast(accent, background, 3);
      const border2 = extra.border || (bold ? label : mix(background, label, 0.24));
      const border1 = extra.border1
        || (extra.border
          ? mix(background, border2, bold ? 0.8 : 0.5)
          : bold
            ? mix(background, label, 0.55)
            : mix(background, label, 0.13));
      const layer1 = extra.layer || (light ? mix(background, '#FFFFFF', 0.6) : mix(background, label, 0.07));
      const layer2 = extra.layer2 || (light ? mix(layer1, label, 0.05) : mix(layer1, label, 0.06));
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
        stateIdle: extra.idle ? ensureContrast(extra.idle, background, 1.8) : mix(label, background, light ? 0.52 : 0.45),
        stateSuccess: success,
        stateWarn: warn,
        sidebarFill: sidebar,
      };
    }

    let customPaletteCache = { input: null, output: null };

    function customPalette(custom) {
      if (customPaletteCache.input === custom) return customPaletteCache.output;
      const shared = {
        error: custom.error,
        success: custom.success,
        warn: custom.warn,
      };
      const mode = (key) => Object.assign({}, shared, custom[key], {
        error: custom[key].error || custom.error,
        success: custom[key].success || custom.success,
        warn: custom[key].warn || custom.warn,
      });
      const palette = {
        id: 'custom',
        light: deriveAnchors(custom.light.bg, custom.light.accent, custom.bold, mode('light')),
        dark: deriveAnchors(custom.dark.bg, custom.dark.accent, custom.bold, mode('dark')),
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

    /** Split a user-entered font-family list into safe family names. */
    function parseFontFamilies(value) {
      if (typeof value !== 'string') return [];
      return value
        .split(',')
        .map((part) => part.trim().replace(/^["']|["']$/g, '').trim())
        .filter((name) => name.length > 0 && /^[\p{L}\p{N} ._@'+-]+$/u.test(name))
        .slice(0, 8);
    }

    function quoteFamilies(names) {
      return names.map((name) => '"' + name.replace(/"/g, '') + '"').join(', ');
    }

    function localFamily(value) {
      return typeof value === 'string' && value.startsWith('local:') ? value.slice(6).trim() : '';
    }

    function composeTextStack(latinId, cjkId, latinCustom, cjkCustom) {
      const latin = findFont(LATIN_FONTS, latinId);
      const cjk = findFont(CJK_FONTS, cjkId);
      const localLatin = localFamily(latinId);
      const localCjk = localFamily(cjkId);
      const latinFamilies = localLatin ? [localLatin] : latin.families;
      const cjkFamilies = localCjk ? [localCjk] : cjk.families;
      if (latinFamilies.length === 0 && cjkFamilies.length === 0) return '';
      const latinStack = latinFamilies.length > 0 ? latinFamilies : DEFAULT_LATIN_FAMILIES;
      const cjkStack = cjkFamilies.length > 0 ? cjkFamilies : DEFAULT_CJK_FAMILIES;
      const generic = cjk.generic || latin.generic || DEFAULT_GENERIC;
      return quoteFamilies(latinStack.concat(cjkStack)) + ', ' + generic;
    }

    function collectTokens(pref) {
      const out = {};
      const palette = paletteFor(pref);
      if (palette) {
        const generated = buildTokens(palette);
        for (const name of Object.keys(generated)) out[name] = generated[name];
      }
      const text = composeTextStack(pref.latin, pref.cjk, pref.latinCustom, pref.cjkCustom);
      if (text) out['--dsh-font-family-text'] = { light: text, dark: text };
      if (pref.code === 'custom') {
        const families = parseFontFamilies(pref.codeCustom);
        if (families.length > 0) {
          const stack = quoteFamilies(families) + ', monospace';
          out['--dsh-font-family-code'] = { light: stack, dark: stack };
        }
      } else if (localFamily(pref.code)) {
        const stack = quoteFamilies([localFamily(pref.code)]) + ', monospace';
        out['--dsh-font-family-code'] = { light: stack, dark: stack };
      } else {
        const codeFont = findFont(CODE_FONTS, pref.code);
        if (codeFont.stack) out['--dsh-font-family-code'] = { light: codeFont.stack, dark: codeFont.stack };
      }
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
      return {
        palette: 'none',
        latin: 'system',
        cjk: 'system',
        code: 'default',
        latinCustom: '',
        cjkCustom: '',
        codeCustom: '',
        custom: defaultCustom(),
        customName: '',
        customs: [],
      };
    }

    function readModeColors(source) {
      const mode = { bg: null, layer: null, overlay: null, sidebar: null, label: null, border: null, accent: null };
      for (const key of CUSTOM_EXTRA_KEYS) mode[key] = null;
      if (!source || typeof source !== 'object') return mode;
      for (const key of CUSTOM_FIELDS.concat(CUSTOM_EXTRA_KEYS)) if (isHexColor(source[key])) mode[key] = source[key];
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
      const fontChoice = (value, list, fallback) =>
        typeof value === 'string' && (list.some((font) => font.id === value) || value.startsWith('local:')) ? value : fallback;
      const latin = fontChoice(data.latin, LATIN_FONTS, 'system');
      const cjk = fontChoice(data.cjk, CJK_FONTS, 'system');
      const code = fontChoice(data.code, CODE_FONTS, 'default');
      const customText = (value) => (typeof value === 'string' ? value.slice(0, 240) : '');
      const customs = Array.isArray(data.customs)
        ? data.customs
            .slice(0, 30)
            .map((entry) => ({
              name: typeof entry?.name === 'string' ? entry.name.trim().slice(0, 40) : '',
              custom: readCustom(entry?.custom),
            }))
            .filter((entry) => entry.name.length > 0)
        : [];
      return {
        palette,
        latin,
        cjk,
        code,
        latinCustom: customText(data.latinCustom),
        cjkCustom: customText(data.cjkCustom),
        codeCustom: customText(data.codeCustom),
        custom: readCustom(data.custom),
        customName: typeof data.customName === 'string' ? data.customName.trim().slice(0, 40) : '',
        customs,
      };
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
        latinCustom: pref.latinCustom,
        cjkCustom: pref.cjkCustom,
        codeCustom: pref.codeCustom,
        custom: pref.custom,
        customName: pref.customName,
        customs: pref.customs,
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

    function cloneCustom(custom) {
      return JSON.parse(JSON.stringify(custom));
    }

    /** Copy a shipped preset into the editable custom shape. */
    function customFromPreset(paletteId) {
      const preset = PALETTES.find((item) => item.id === paletteId);
      if (!preset) return defaultCustom();
      const mode = (p) => ({
        bg: p.bgBase,
        layer: p.bgLayer1,
        layer2: p.bgLayer2,
        overlay: p.bgOverlay,
        sidebar: p.sidebarFill,
        label: p.labelPrimary,
        label2: p.labelSecondary,
        border: p.borderL2,
        border1: p.borderL1,
        accent: p.brandPrimary,
        error: p.stateError,
        success: p.stateSuccess,
        warn: p.stateWarn,
        idle: p.stateIdle,
      });
      return {
        light: mode(preset.light),
        dark: mode(preset.dark),
        error: preset.light.stateError,
        success: preset.light.stateSuccess,
        warn: preset.light.stateWarn,
        bold: paletteId === 'mx-brutalist',
      };
    }

    function saveCustomTheme(name) {
      const trimmed = String(name || '').trim().slice(0, 40);
      if (!trimmed) return;
      const current = prefStore.get();
      const entry = { name: trimmed, custom: cloneCustom(current.custom) };
      const customs = current.customs
        .filter((item) => item.name !== trimmed)
        .concat([entry])
        .slice(0, 30);
      updatePref({ palette: 'custom', customName: trimmed, customs });
    }

    function loadCustomTheme(name) {
      const current = prefStore.get();
      const entry = current.customs.find((item) => item.name === name);
      if (!entry) return;
      updatePref({ palette: 'custom', custom: cloneCustom(entry.custom), customName: entry.name });
    }

    function deleteCustomTheme(name) {
      const current = prefStore.get();
      const customs = current.customs.filter((item) => item.name !== name);
      updatePref({ customs, customName: current.customName === name ? '' : current.customName });
    }

    function cloneCustomBase(paletteId) {
      updatePref({ palette: 'custom', custom: customFromPreset(paletteId), customName: '' });
    }

    function cloneSavedCustom(name) {
      const entry = prefStore.get().customs.find((item) => item.name === name);
      if (!entry) return;
      updatePref({ palette: 'custom', custom: cloneCustom(entry.custom), customName: entry.name });
    }

    function downloadJson(filename, payload) {
      if (typeof document === 'undefined') return;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = String(filename || 'dsh-theme').replace(/[\\/:*?"<>|]+/g, '-') + '.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function exportCustomTheme() {
      const current = prefStore.get();
      downloadJson(current.customName || 'dsh-theme', {
        format: 'dsh-theme-custom',
        version: 1,
        name: current.customName || 'dsh-theme',
        custom: current.custom,
      });
    }

    function exportThemePack(entries) {
      downloadJson('dsh-themes', {
        format: 'dsh-theme-pack',
        version: 1,
        themes: entries.map((entry) => ({ name: entry.name, custom: entry.custom })),
      });
    }

    function stripJsonComments(text) {
      return String(text || '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
    }

    function exampleThemeJson(t) {
      return [
        '{',
        '  // ' + t('custom.exampleName'),
        '  "name": "My theme",',
        '  "custom": {',
        '    // ' + t('custom.exampleHint'),
        '    "light": { "bg": "#FAF8F1", "layer": "#FFFFFF", "accent": "#BB5A38" },',
        '    "dark": { "bg": "#1F1E1B", "layer": "#2A2824", "accent": "#BB5A38" }',
        '  }',
        '}',
      ].join('\n');
    }

    function importCustomTheme(t) {
      if (typeof window === 'undefined' || typeof window.prompt !== 'function') return false;
      const raw = window.prompt(t('custom.importPrompt'));
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        const custom = readCustom(data && data.custom ? data.custom : data);
        const name = data && typeof data.name === 'string' ? data.name.trim().slice(0, 40) : '';
        updatePref({ palette: 'custom', custom, customName: name });
        return true;
      } catch (error) {
        window.alert(t('custom.importFailed'));
        return false;
      }
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
        h(
          'div',
          { className: 'dsph-sectionTitle' },
          h('span', null, t('themeTitle')),
          h('button', { type: 'button', className: 'dsph-importTheme', onClick: props.onImport }, t('theme.import')),
        ),
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
        h('div', { className: 'dsph-themeHint' }, t('theme.hint')),
      );
    }

    function CustomThemeList(props) {
      const t = props.t;
      if (!props.customs.length) return null;
      return h(
        'div',
        { className: 'dsph-section dsph-sectionSaved' },
        h(
          'div',
          { className: 'dsph-sectionTitle' },
          h('span', null, t('custom.savedTitle')),
          props.managing
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dsph-fontDetect',
                  disabled: props.selected.length === 0,
                  onClick: props.onExport,
                },
                t('custom.export'),
              )
            : null,
          props.managing
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dsph-fontDetect',
                  disabled: props.selected.length === 0,
                  onClick: props.onDelete,
                },
                t('custom.delete'),
              )
            : null,
          h(
            'button',
            { type: 'button', className: 'dsph-fontDetect', onClick: props.onManage },
            props.managing ? t('custom.done') : t('custom.manage'),
          ),
        ),
        h(
          'div',
          { className: 'dsph-savedList' },
          props.customs.map((entry) => {
            const active = props.activeName === entry.name;
            const selected = props.selected.includes(entry.name);
            return h(
              'button',
              {
                key: entry.name,
                type: 'button',
                className: 'dsph-savedTheme' + (active ? ' dsph-savedThemeActive' : ''),
                'aria-pressed': active,
                title: entry.name,
                onClick: () => (props.managing ? props.onToggle(entry.name) : props.onLoad(entry.name)),
              },
              props.managing || active
                ? h(
                    'span',
                    { className: 'dsph-savedCheck' },
                    props.managing
                      ? selected
                        ? h(IconCheck, { size: 10 })
                        : null
                      : h(IconCheck, { size: 10 }),
                  )
                : null,
              h('span', {
                className: 'dsph-savedSwatch',
                style: {
                  background:
                    'linear-gradient(135deg, ' + entry.custom.light.bg + ' 0 50%, ' + entry.custom.light.accent + ' 50% 100%)',
                },
              }),
              h(
                'span',
                { className: 'dsph-savedBody' },
                h('span', { className: 'dsph-savedName' }, entry.name),
                h('span', { className: 'dsph-savedTag' }, t('theme.custom')),
              ),
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

    function BaseStrip(props) {
      const t = props.t;
      return h(
        'div',
        { className: 'dsph-baseStrip', role: 'group', 'aria-label': t('custom.basePlaceholder') },
        props.options.map((option) => {
          const swatch = option.custom
            ? { bg: option.custom.light.bg, accent: option.custom.light.accent }
            : swatchFor(option.id, props.custom);
          return h(
            'button',
            {
              key: option.id,
              type: 'button',
              className: 'dsph-baseChip',
              title: option.label,
              onClick: () => props.onPick(option),
            },
            h('span', {
              className: 'dsph-baseSwatch',
              style: { background: 'linear-gradient(135deg, ' + swatch.bg + ' 0 50%, ' + swatch.accent + ' 50% 100%)' },
            }),
            h('span', { className: 'dsph-baseLabel' }, option.label),
            option.tag ? h('span', { className: 'dsph-baseTag' }, t('theme.custom')) : null,
          );
        }),
      );
    }

    function CustomEditor(props) {
      const t = props.t;
      const custom = props.custom;
      const pref = props.pref;
      const [mode, setMode] = useState('light');
      const [draftName, setDraftName] = useState(pref.customName || '');
      const [nameError, setNameError] = useState(false);
      useEffect(() => {
        setDraftName(pref.customName || '');
        setNameError(false);
      }, [pref.customName]);
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
      const baseOptions = [{ id: 'none', label: t('theme.none') }]
        .concat(PALETTES.map((palette) => ({ id: palette.id, label: t('theme.' + palette.id) })))
        .concat(
          pref.customs.map((entry) => ({
            id: 'saved:' + entry.name,
            label: entry.name,
            custom: entry.custom,
            tag: true,
          })),
        );
      const pickBase = (option) => {
        if (option.tag) props.onCloneSaved(option.id.slice(6));
        else props.onClone(option.id);
      };
      const saveNamed = () => {
        const name = draftName.trim();
        if (!name) {
          setNameError(true);
          return;
        }
        setNameError(false);
        props.onSave(name);
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
          { className: 'dsph-customManage' },
          h(
            'div',
            { className: 'dsph-customRow' },
            h('input', {
              type: 'text',
              className: 'dsph-customName' + (nameError ? ' dsph-customNameError' : ''),
              value: draftName,
              placeholder: t('custom.namePlaceholder'),
              'aria-label': t('custom.namePlaceholder'),
              onChange: (event) => {
                setDraftName(event.target.value);
                setNameError(false);
              },
            }),
            h(
              'button',
              { type: 'button', className: 'dsph-miniButton', onClick: saveNamed },
              t('custom.save'),
            ),
          ),
          nameError ? h('div', { className: 'dsph-customError' }, t('custom.nameRequired')) : null,
          h('div', { className: 'dsph-customLabel' }, t('custom.baseLabel')),
          h(BaseStrip, { t: t, custom: custom, options: baseOptions, onPick: pickBase }),
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
            value: custom[mode].error || custom.error || anchors.stateError,
            onChange: (value) => setModeField('error', value),
          }),
          h(ColorField, {
            label: t('color.success'),
            value: custom[mode].success || custom.success || anchors.stateSuccess,
            onChange: (value) => setModeField('success', value),
          }),
          h(ColorField, {
            label: t('color.warn'),
            value: custom[mode].warn || custom.warn || anchors.stateWarn,
            onChange: (value) => setModeField('warn', value),
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
      const current = options.find((option) => option.id === props.value) || options[0];
      const labelOf = (option) => option.label || t(props.prefix + option.id);
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
            h('span', { className: 'dsph-selectValue' }, labelOf(current)),
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
                    h('span', { className: 'dsph-optionLabel' }, labelOf(option)),
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
      const [localFonts, setLocalFonts] = useState([]);
      const [showLocalFonts, setShowLocalFonts] = useState(true);
      const [fontNotice, setFontNotice] = useState('');
      const [importOpen, setImportOpen] = useState(false);
      const [importText, setImportText] = useState('');
      const [importError, setImportError] = useState('');
      const [manageThemes, setManageThemes] = useState(false);
      const [selectedThemes, setSelectedThemes] = useState([]);
      const percent = Math.round((themeState.text / TEXT_SIZE_DEFAULT) * 100) + '%';

      const openImport = () => {
        setImportText('');
        setImportError('');
        setImportOpen(true);
      };

      const applyImport = () => {
        try {
          const data = JSON.parse(stripJsonComments(importText));
          const current = prefStore.get();
          const entries = Array.isArray(data && data.themes)
            ? data.themes
                .map((entry) => ({
                  name: typeof entry?.name === 'string' && entry.name.trim() ? entry.name.trim().slice(0, 40) : t('custom.importedName'),
                  custom: readCustom(entry?.custom || entry),
                }))
            : [{
                name: data && typeof data.name === 'string' && data.name.trim()
                  ? data.name.trim().slice(0, 40)
                  : t('custom.importedName'),
                custom: readCustom(data && data.custom ? data.custom : data),
              }];
          const customs = current.customs.slice();
          for (const entry of entries) {
            const index = customs.findIndex((item) => item.name === entry.name);
            if (index >= 0) customs[index] = entry;
            else customs.push(entry);
          }
          updatePref({
            palette: 'custom',
            custom: cloneCustom(entries[0].custom),
            customName: entries[0].name,
            customs: customs.slice(0, 30),
          });
          setImportOpen(false);
          setEditingCustom(true);
        } catch (error) {
          setImportError(t('custom.importFailed'));
        }
      };

      const readImportFile = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImportText(String(reader.result || ''));
        reader.onerror = () => setImportError(t('custom.importFailed'));
        reader.readAsText(file);
      };

      const detectLocalFonts = (showNotice) => {
        if (typeof window === 'undefined' || typeof window.queryLocalFonts !== 'function') {
          if (showNotice) setFontNotice(t('font.detectUnsupported'));
          return;
        }
        try {
          Promise.resolve(window.queryLocalFonts())
            .then((fonts) => {
              const families = Array.from(
                new Set((fonts || []).map((font) => font.family).filter((family) => typeof family === 'string' && family)),
              ).sort();
              setLocalFonts(families);
              setFontNotice(families.length > 0 ? '' : showNotice ? t('font.detectFailed') : '');
            })
            .catch(() => {
              if (showNotice) setFontNotice(t('font.detectFailed'));
            });
        } catch (error) {
          if (showNotice) setFontNotice(t('font.detectFailed'));
        }
      };

      const localFontOptions = showLocalFonts
        ? localFonts.map((family) => ({
            id: 'local:' + family,
            label: t('font.localPrefix') + family,
          }))
        : [];

      useEffect(() => {
        detectLocalFonts(false);
      }, []);

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
          ? h(CustomEditor, {
              t: t,
              custom: pref.custom,
              pref: pref,
              onBack: () => setEditingCustom(false),
              onSave: saveCustomTheme,
              onLoad: loadCustomTheme,
              onClone: cloneCustomBase,
              onCloneSaved: cloneSavedCustom,
            })
          : h(ThemeGrid, {
              t: t,
              value: pref.palette,
              custom: pref.custom,
              onCustom: () => setEditingCustom(true),
              onImport: openImport,
            }),
          !editingCustom
          ? h(CustomThemeList, {
              t: t,
              customs: pref.customs,
              activeName: pref.palette === 'custom' ? pref.customName : '',
              managing: manageThemes,
              selected: selectedThemes,
              onManage: () => {
                setManageThemes(!manageThemes);
                setSelectedThemes([]);
              },
              onToggle: (name) =>
                setSelectedThemes((list) => (list.includes(name) ? list.filter((item) => item !== name) : list.concat([name]))),
              onDelete: () => {
                const current = prefStore.get();
                const customs = current.customs.filter((entry) => !selectedThemes.includes(entry.name));
                updatePref({
                  customs,
                  customName: selectedThemes.includes(current.customName) ? '' : current.customName,
                });
                setSelectedThemes([]);
                setManageThemes(false);
              },
              onExport: () =>
                exportThemePack(pref.customs.filter((entry) => selectedThemes.includes(entry.name))),
              onLoad: (name) => loadCustomTheme(name),
            })
          : null,
        h(
          'div',
          { className: 'dsph-section' },
          h(
            'div',
            { className: 'dsph-sectionTitle' },
            h('span', null, t('fontsTitle')),
            h(
              'label',
              { className: 'dsph-fontToggle' },
              h('input', {
                type: 'checkbox',
                checked: showLocalFonts,
                onChange: (event) => setShowLocalFonts(event.target.checked),
              }),
              t('font.showLocal'),
            ),
            h(
              'button',
              { type: 'button', className: 'dsph-fontDetect', onClick: () => detectLocalFonts(true) },
              t('font.detect'),
            ),
          ),
          h(
            'div',
            { className: 'dsph-fontRow' },
            h(Select, {
              t: t,
              id: 'latin',
              prefix: 'font.latin.',
              label: t('latin'),
              value: pref.latin,
              options: LATIN_FONTS.concat(localFontOptions),
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
              options: CJK_FONTS.concat(localFontOptions),
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
              options: CODE_FONTS.concat(localFontOptions),
              open: openMenu === 'code',
              onToggle: setOpenMenu,
              onPick: (role, id) => updatePref({ code: id }),
            }),
          ),
          fontNotice ? h('div', { className: 'dsph-fontNotice', role: 'status' }, fontNotice) : null,
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
        importOpen
          ? h(
              'div',
              { className: 'dsph-dialogOverlay' },
              h(
                'div',
                { className: 'dsph-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('theme.import') },
                h('div', { className: 'dsph-dialogTitle' }, t('theme.import')),
                h('textarea', {
                  className: 'dsph-dialogText',
                  value: importText,
                  placeholder: t('custom.importPlaceholder'),
                  onChange: (event) => setImportText(event.target.value),
                }),
                h(
                  'div',
                  { className: 'dsph-dialogTools' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsph-miniButton',
                      onClick: () => setImportText(exampleThemeJson(t)),
                    },
                    t('custom.example'),
                  ),
                  h(
                    'label',
                    { className: 'dsph-miniButton dsph-fileButton' },
                    t('custom.fromFile'),
                    h('input', {
                      type: 'file',
                      accept: '.json,application/json',
                      onChange: readImportFile,
                    }),
                  ),
                ),
                importError ? h('div', { className: 'dsph-dialogError' }, importError) : null,
                h(
                  'div',
                  { className: 'dsph-dialogActions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsph-miniButton',
                      onClick: () => setImportOpen(false),
                    },
                    t('custom.cancel'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsph-miniButton dsph-dialogConfirm',
                      onClick: applyImport,
                    },
                    t('custom.importConfirm'),
                  ),
                ),
              ),
            )
          : null,
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
.dsph-panel{position:fixed;left:12px;bottom:64px;z-index:70;width:min(356px,calc(100vw - 24px));max-height:min(660px,calc(100vh - 84px));overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;box-sizing:border-box;padding:11px 12px 11px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18));font-family:var(--dsw-font-family);pointer-events:auto}
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
.dsph-themes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
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
.dsph-customManage{display:flex;flex-direction:column;gap:4px;margin-bottom:2px}
.dsph-customRow{display:flex;align-items:center;gap:4px;min-width:0}
.dsph-customName{flex:1;min-width:0;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;line-height:14px;padding:5px 7px;outline:none}
.dsph-customName:focus{border-color:var(--dsw-alias-brand-primary)}
.dsph-customNameError{border-color:var(--dsw-alias-state-error-primary)}
.dsph-customError{font-size:10px;line-height:13px;color:var(--dsw-alias-state-error-primary)}
.dsph-nativeSelect{flex:1;min-width:0;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;line-height:14px;padding:4px 6px;outline:none}
.dsph-miniButton{flex:none;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;line-height:14px;padding:4px 7px;cursor:pointer}
.dsph-miniButton:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsph-miniButton:disabled{opacity:.4;cursor:default}
.dsph-customActions{justify-content:flex-end}
.dsph-basePicker{position:relative;flex:1;min-width:0}
.dsph-baseButton{width:100%}
.dsph-baseMenu{bottom:auto;top:calc(100% + 4px);left:0;right:0;min-width:0}
.dsph-optionSwatch{width:18px;height:18px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}
.dsph-baseOption .dsph-optionLabel{flex:1}
.dsph-importTheme{margin-left:auto;border:none;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:10px;line-height:14px;cursor:pointer;padding:0;opacity:.9}
.dsph-importTheme:hover{text-decoration:underline}
.dsph-themeHint{font-size:10px;line-height:13px;color:var(--dsw-alias-label-secondary);margin-top:6px}
.dsph-sectionSaved{margin-top:2px}
.dsph-savedList{display:flex;gap:4px;overflow-x:auto;overflow-y:hidden;padding:2px 0 3px;max-width:100%}
.dsph-savedTheme{display:flex;align-items:center;gap:5px;flex:none;max-width:170px;padding:4px 6px;border:.5px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.dsph-savedTheme:hover{background:var(--dsw-alias-bg-layer-2)}
.dsph-savedThemeActive{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.dsph-savedCheck{width:10px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);flex:none}
.dsph-savedSwatch{width:18px;height:18px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}
.dsph-savedBody{display:flex;flex-direction:column;min-width:0;text-align:left}
.dsph-savedName{font-size:11px;line-height:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px}
.dsph-savedTag{font-size:8px;line-height:10px;color:var(--dsw-alias-label-secondary)}
.dsph-baseStrip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;max-height:96px;overflow-y:auto;overflow-x:hidden;padding:2px 0}
.dsph-baseChip{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0;padding:3px 2px;border:.5px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer}
.dsph-baseChip:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsph-baseSwatch{width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}
.dsph-baseLabel{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:11px}
.dsph-baseTag{font-size:8px;line-height:10px;color:var(--dsw-alias-brand-primary)}
.dsph-customLabel{font-size:10px;line-height:13px;color:var(--dsw-alias-label-secondary);margin-top:1px}
.dsph-dialogOverlay{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:12px;border-radius:16px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent)}
.dsph-dialog{width:100%;max-width:320px;box-sizing:border-box;padding:10px;border-radius:12px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18));display:flex;flex-direction:column;gap:6px}
.dsph-dialogTitle{font-size:12px;line-height:16px;font-weight:600}
.dsph-dialogText{width:100%;height:120px;box-sizing:border-box;resize:none;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:10px;line-height:13px;padding:6px;outline:none}
.dsph-dialogText:focus{border-color:var(--dsw-alias-brand-primary)}
.dsph-dialogError{font-size:10px;line-height:13px;color:var(--dsw-alias-state-error-primary)}
.dsph-dialogActions{display:flex;justify-content:flex-end;gap:4px}
.dsph-dialogTools{display:flex;gap:4px;flex-wrap:wrap}
.dsph-fileButton{cursor:pointer}
.dsph-fileButton input{display:none}
.dsph-dialogConfirm{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
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
.dsph-fontField{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsph-fontInput{width:100%;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;line-height:14px;padding:5px 7px;outline:none}
.dsph-fontInput:focus{border-color:var(--dsw-alias-brand-primary)}
.dsph-fontDetect{border:none;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:10px;line-height:14px;padding:0;cursor:pointer;opacity:.85}
.dsph-fontDetect:hover{text-decoration:underline}
.dsph-fontToggle{display:inline-flex;align-items:center;gap:3px;margin-left:auto;font-size:10px;line-height:14px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dsph-fontToggle input{margin:0;accent-color:var(--dsw-alias-brand-primary)}
.dsph-fontNotice{font-size:10px;line-height:13px;color:var(--dsw-alias-label-secondary)}
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

    /** Palette glyph for the Settings navigation, matching the plugin's icon. */
    function PaletteIcon(props) {
      const size = props.size || 18;
      const active = Boolean(props.active);
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '9 9 30 30',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('circle', {
          cx: 24,
          cy: 24,
          r: 13.2,
          stroke: 'currentColor',
          strokeWidth: 2.2,
          strokeOpacity: active ? 1 : 0.82,
        }),
        h('circle', { cx: 18.3, cy: 19.5, r: 3.1, fill: '#D97757', fillOpacity: active ? 1 : 0.86 }),
        h('circle', { cx: 29.9, cy: 19.2, r: 3.1, fill: '#F2C14E', fillOpacity: active ? 1 : 0.86 }),
        h('circle', { cx: 31.2, cy: 29.3, r: 3.1, fill: '#5E8BFF', fillOpacity: active ? 1 : 0.86 }),
        h('path', {
          d: 'M17.1 31.1c2.6 2.2 6.1 3.2 9.5 2.6',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeOpacity: active ? 0.65 : 0.5,
          strokeLinecap: 'round',
        }),
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
      ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'dsh-theme: dictionaries');
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

      ctx.slots.inject('settings.section.icon', () =>
        ctx.slots.register(
          {
            name: 'settings.section.icon',
            id: 'dsh-theme',
          },
          PaletteIcon,
        ),
      );
    }

    return { inject, apply };
  },
});
