# Tema DSH

[简体中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Русский](README.ru.md) | **Português**

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Den)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

Paletas de tema, editor de cores DIY completo, biblioteca de temas personalizados
com nome, fontes locais e tamanho do texto para a interface web do
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Abre pelo ícone
de paleta no canto inferior esquerdo da barra lateral.

Claro e escuro têm o mesmo suporte: cada preset e cada cor DIY guarda valores para os
dois modos, então continua funcionando quando a aparência do sistema alterna entre
claro, escuro e automático.

## Capturas

A interface em inglês é mostrada aqui; o README chinês usa capturas em chinês. Os
demais idiomas compartilham o mesmo layout.

| Painel principal | Editor de tema personalizado |
|:---:|:---:|
| <img src="docs/screenshots/panel-en.png" width="310" alt="Painel em inglês com 14 presets"> | <img src="docs/screenshots/panel-en-custom.png" width="310" alt="Editor personalizado em inglês com amostras de base e campos de cor"> |

**Configurações → Tema**

<img src="docs/screenshots/settings-en.png" width="560" alt="Página de tema na interface em inglês">

**Entrada**: o ícone de paleta no **canto inferior esquerdo da barra lateral**, na
linha acima de Configurações. A mesma página fica em **Configurações → Tema**.

## Recursos

- **14 presets**: Padrão, Quente, Mono, Claude, Claude+, Vermelho-cinábrio, Âmbar
  Mono, MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox e Tokyo Night**,
  além do cartão **Personalizado**.
- **Editor DIY**: por modo claro/escuro, edite fundo, cartão, popover, barra lateral,
  texto, borda e o destaque do modo; as cores de status são salvas por modo; há a
  opção **Bordas grossas**. Campos não editados são derivados automaticamente.
- **Bases fiéis ao preset**: começar de um preset copia as 14 âncoras nos dois modos
  e mantém características como as bordas grossas do MX Brutalist.
- **Temas com nome**: salve com um nome, alterne em **Meus temas** com o ativo
  marcado e use **Gerenciar** para selecionar vários, excluir ou exportar.
- **Importação/exportação JSON**: exporte um tema ou pacote para `.json`; importe
  colando JSON ou escolhendo um arquivo. O diálogo inclui um exemplo comentado, e os
  temas importados aparecem em **Meus temas** com o `name` do JSON.
- **Fontes**: pilhas independentes para latim, chinês e código. Cada menu lista os
  presets e as **fontes lidas deste computador** (`Local ·`), com opção de ocultar e
  **Detectar fontes locais**; duplicatas com presets são permitidas.
- **Tamanho do texto**: 10–22 px pelo serviço nativo de tema, mantido após recarregar.
- **Oito idiomas**: chinês simplificado, inglês, japonês, espanhol, francês, alemão,
  russo e português do Brasil.
- **Persistência após reiniciar**: as escolhas ficam no documento de configurações
  do Host do DSH.

## Referência de paletas

![Folha de referência de paletas](research/preview.png)

## Instalação

### Discover (recomendado)

1. Abra **Plugins → Discover**.
2. Adicione esta fonte de índice:

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.5.0/market/index.json
   ```

3. Encontre **DSH Theme**, abra a página e clique em **Install**.

O índice está fixado no commit Git da versão 1.5.0. A mesma versão é publicada no
npm como `@solvashq/dsh-theme@1.5.0`, e o GitHub Release inclui `dsh-theme.tgz`.

### npm

```bash
npm install @solvashq/dsh-theme
```

Ou peça ao seu agente DSH para instalar `@solvashq/dsh-theme@1.5.0`.

### A partir do código-fonte

```bash
git clone https://github.com/SolvasHQ/dsh-theme.git
cd dsh-theme
pnpm install --prod
```

Vincule o diretório à lista de bundles do seu perfil DSH (de preferência pelo Plugin
Manager com o caminho absoluto), execute `pnpm install` no perfil e reinicie o DSH.

## Compatibilidade

Testado no DeepSeek Harness desktop `0.2.2-rc.1` (Web GUI); a linha 0.2.1-rc.2
continua funcionando. O plugin usa apenas as extensões públicas do cliente (`slots`,
`theme`, `locale`, `configForms`) e a configuração volatile do Host.

## Créditos das paletas

Catppuccin, Nord, Gruvbox e Tokyo Night são paletas da comunidade criadas por seus
respectivos autores. São usadas como referência de cor, mapeadas para as 14 âncoras
do DSH com ajustes de contraste; os links estão em `research/palettes.json` em
`sources`, e vale a licença de cada projeto.

## Licença

MIT — consulte [LICENSE](LICENSE).

[Registro de alterações](CHANGELOG.md) · [Problemas](https://github.com/SolvasHQ/dsh-theme/issues)
