# DSH 主题

[English](README.md) | **简体中文**

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Dzh)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI 提供
主题配色、完整 DIY 调色、具名自定义主题库、本机字体与界面字号；入口在侧边栏左下角
的调色盘图标。

明暗双模：每套预设和每项 DIY 颜色都同时带浅色与深色两套值，因此原生外观在
浅色 / 深色 / 跟随系统之间切换时依然生效。

> **开发版说明**：下面的截图和功能对应 `main` 分支；当前已发布的 npm / Discover
> 版本是 `1.4.0`，下一次发布会包含这些新增内容。

## 界面截图

这里使用中文界面；其他七种语言共用同一布局（英文 README 使用英文截图）。

| 中文主面板 | 中文自定义主题编辑器 |
|:---:|:---:|
| <img src="docs/screenshots/panel-zh.png" width="310" alt="中文个性化主面板：14 套预设"> | <img src="docs/screenshots/panel-zh-custom.png" width="310" alt="中文自定义主题编辑器：基底色块、颜色字段与状态色"> |

**设置 → 主题**

<img src="docs/screenshots/settings-zh.png" width="560" alt="中文设置页中的主题页面">

**入口**：侧边栏**左下角的调色盘图标**，就在 Settings 按钮上方那一行图标里。
同样的页面也在 **设置 → 主题** 中。

## 功能

- **左下角入口**：侧边栏底部（Settings 按钮上方的图标行）新增调色盘图标，点击在
  左下角弹出紧凑面板。
- **主题设置页**：同样内容作为独立的「主题」页出现在设置中，导航使用调色盘图标。
- **14 套主题配色**：默认（原生外观）、暖白、单色、克劳德、克劳德+、朱红、
  琥珀单色、粗暴极简、墨青、暗紫，以及 **Catppuccin、Nord、Gruvbox、Tokyo
  Night**，另有「自定义」。
- **DIY 调色编辑器**：浅色/深色分开编辑背景、卡片、弹层、侧栏、文字、边框，以及
  该模式自己的强调色；错误/成功/警告状态色也按模式保存；另有「加粗边框」开关。
  未手动指定的槽位会从背景/文字自动派生。
- **完整预设基底**：从任意预设开始自定义时，会复制两套模式各自的全部 14 个锚点，
  并继承预设特征（例如 **粗暴极简** 会自动开启加粗边框）。
- **具名自定义主题**：给当前主题命名保存，在主题网格下方的「我的主题」里切换，
  当前主题显示 ✓；进入「管理」后可多选、删除或导出。
- **JSON 导入/导出**：支持导出单个主题或主题包为 `.json` 文件；导入时可粘贴 JSON
  或选择文件，弹窗内提供带注释的示例。导入的主题会进入「我的主题」，名称取自
  JSON 的 `name`。
- **字体**：英文、中文、代码字体独立选择，作用于界面、对话与代码。每个角色会列出
  内置方案，并追加**从本机读取的字体**（标记为 `本机 ·`）；可用复选框隐藏本机
  字体，点「检测本机字体」刷新列表，允许和预设字体重名。
- **界面字号**：10–22px，走原生主题服务，重载后保留，并与 Ctrl/Cmd `+`/`-`
  快捷键同步。
- **八种语言**：跟随通用设置切换：简体中文、English、日本語、Español、
  Français、Deutsch、Русский、Português (Brasil)。
- **重启不丢失**：选择写入 DSH 的 Host 设置文档（volatile config），重启应用、
  更换本地端口后依然保留。

## 调色板参考

十四套预设的浅色 / 深色配色对照：

![调色板参考图](research/preview.png)

## 安装

### Discover（推荐）

1. 打开 **Plugins → Discover**。
2. 添加索引源：

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.4.0/market/index.json
   ```

   索引钉在版本 tag 上，可立即使用；如果希望跟随最新提交，可把 tag 换成
   `@main`——jsDelivr 对该分支可能有最长约 12 小时的缓存。

3. 找到 **DSH 主题**，打开详情页，点击 **Install**。

Discover 会安装该版本固定到 Git commit 的代码。同一版本也已发布到 npm
（`@solvashq/dsh-theme@1.4.0`），GitHub Release 也附带预构建的
`dsh-theme.tgz`。

### npm

已发布为 [`@solvashq/dsh-theme`](https://www.npmjs.com/package/@solvashq/dsh-theme)：

```bash
npm install @solvashq/dsh-theme
```

也可以让 DSH Agent 直接从 npm 安装这个 bundle，spec 用
`@solvashq/dsh-theme@1.4.0`。

### 从源码安装（开发）

> 这是一个 **本地 DSH bundle**。安装方式是把克隆下来的目录链接进 DSH profile 的
> bundle 列表。运行需要 Node.js 20+ 与 pnpm。

1. 克隆仓库到固定位置：

   ```bash
   git clone https://github.com/SolvasHQ/dsh-theme.git
   cd dsh-theme
   ```

2. 在**插件目录内**安装运行时依赖。DSH 以保留符号链接的方式加载 profile 插件，
   因此 schema 库及其传递依赖必须位于插件自己的 `node_modules` 中：

   ```bash
   pnpm install --prod
   ```

3. 在 DSH profile 中注册该 bundle。推荐让 DSH 的 Agent 用 Plugin Manager 的
   bundle 安装方式安装这个目录（传绝对路径）。也可以手动编辑
   `<profile>/package.json`：

   ```json
   {
     "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@solvashq/dsh-theme"] } },
     "dependencies": { "@solvashq/dsh-theme": "link:/绝对路径/dsh-theme" }
   }
   ```

   然后在 profile 目录执行 `pnpm install` 并重启 DSH。

4. 打开 Web GUI：左下角出现调色盘图标；设置中也出现「主题」页。

之后修改 `client.js` 会被 DSH 的客户端 HMR 在约一秒内热替换；修改 Host 侧代码
需要重启 DSH。

## 实现要点

- **主题覆盖层**：客户端用 `ctx.theme.overrideTokens('@solvashq/dsh-theme', tokens)`
  注册单一 token 覆盖层，每个 token 都是 `{ light, dark }` 对，因此叠加在原生
  配色之上，系统明暗切换无需重新注册主题。
- **token 生成**：每套配色/模式用 14 个锚点色生成约 97 个
  `--dsw-alias-*` / `--dsw-specific-*` 语义 token（表面、边框、文字、按钮、状态、
  Markdown/代码、diff、滚动条、toast、侧栏），并带对比度保护。
- **DIY 配色**：运行时从所选背景、边框、文字色与各模式强调色派生；从预设开始时
  会保留全部锚点，所以未编辑的槽位仍保持原预设的明暗关系。
- **自定义主题库**：与字体、当前配色一起存在 Host 设置的 `preferences` 字段里。
- **字体**：`--dsh-font-family-text` / `--dsh-font-family-code` 随 token 层下发。
  内置方案与本机字体共用一个菜单，中英文字体栈自动拼接，未选的一侧回落到默认栈。
- **语言**：为 DSH 的八种语言各注册一份客户端词典（`zh`、`en`、`ja`、`es`、
  `fr`、`de`、`ru`、`pt`）；主题名和字体品牌名保留原文。
- **字号**：使用主题服务持久化的 `setFontSize('text', px)`。
- **持久化**：Host 半边声明一个 `.volatile()` 字符串字段，客户端通过
  `ctx.configForms` 读写，DSH 会把它写入当前 profile 的 patch。

## 开发

```bash
# 修改 src/client.template.js 或 research/palettes.json 后重新构建
node build/build-client.mjs
node --check client.js

# 静态检查（manifest、语言包、图标、构建产物）
node tools/check-manifest.mjs

# Discover 市场索引校验
node tools/check-market.mjs

# 全部配色与 DIY 情况的 token/对比度检查
node tools/verify-tokens.mjs

# 面板组件功能测试（渲染 → 点击 → 断言）
node tools/check-panel.mjs
```

浏览器模块加载器不能 import 本地文件，所以 `build/build-client.mjs` 会把
`research/palettes.json` 内联进 `client.js`。`client.js` 是提交进仓库的构建产物，
CI 会重新构建并检查它是否最新。

## 目录结构

```
client.js                 浏览器端构建产物（提交）
index.js                  Host 半边：volatile 设置字段
cordis.patch.yml          bundle patch，插入插件行
locale/                   八种语言的插件元数据
src/client.template.js    客户端源码模板
build/build-client.mjs    构建脚本（palettes → client.js）
market/index.json         Discover 市场索引（format 1）
docs/screenshots/         README 截图（中文 / 英文界面）
research/                 配色锚点、设计说明、调色板图
tools/                    manifest、market、token、面板验证脚本
```

## 兼容性

在 DeepSeek Harness 桌面版 `0.2.2-rc.1`（Web GUI）上验证；0.2.1-rc.2 也仍然
可用。插件只使用公开的客户端扩展点（`slots`、`theme`、`locale`、
`configForms`）与 Host volatile config，不修改 Harness 本身、不读取其他插件的
DOM。

## 配色致谢

Catppuccin、Nord、Gruvbox、Tokyo Night 是各自作者维护的社区配色。本项目把它们
作为颜色参考，映射到 DSH 的 14 个锚点并做了对比度调整；链接记录在
`research/palettes.json` 的 `sources` 中，许可证以各自仓库为准。

## 许可证

MIT，见 [LICENSE](LICENSE)。

[更新日志](CHANGELOG.md) · [问题反馈](https://github.com/SolvasHQ/dsh-theme/issues)
