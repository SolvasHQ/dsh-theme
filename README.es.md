# Tema DSH

[简体中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md) | **Español** | [Français](README.fr.md) | [Deutsch](README.de.md) | [Русский](README.ru.md) | [Português](README.pt.md)

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Den)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

Paletas de tema, un editor de color DIY completo, una biblioteca de temas
personalizados con nombre, fuentes locales y tamaño de texto para la interfaz web
de [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Se abre
desde el icono de paleta en la esquina inferior izquierda de la barra lateral.

Claro y oscuro están al mismo nivel: cada preajuste y cada color DIY guarda un
valor para ambos modos, así que sigue funcionando cuando la apariencia del sistema
cambia entre claro, oscuro y automático.

## Capturas

Se muestra la interfaz en inglés; el README chino usa capturas en chino. El resto
de idiomas comparte el mismo diseño.

| Panel principal | Editor de temas personalizados |
|:---:|:---:|
| <img src="docs/screenshots/panel-en.png" width="310" alt="Panel en inglés con 14 preajustes"> | <img src="docs/screenshots/panel-en-custom.png" width="310" alt="Editor personalizado en inglés con muestras base y campos de color"> |

**Ajustes → Tema**

<img src="docs/screenshots/settings-en.png" width="560" alt="Página de tema en la interfaz inglesa">

**Entrada**: el icono de paleta en la **esquina inferior izquierda de la barra
lateral**, en la fila situada encima de Ajustes. La misma página está en
**Ajustes → Tema**.

## Funciones

- **14 preajustes**: Predeterminado, Cálido, Mono, Claude, Claude+, Bermellón,
  Ámbar Mono, MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox y Tokyo
  Night**, más una tarjeta **Personalizado**.
- **Editor DIY**: por modo claro/oscuro edita fondo, tarjeta, ventana emergente,
  barra lateral, texto, borde y el acento de ese modo; los colores de estado se
  guardan por modo; incluye **Bordes gruesos**. Los campos no editados se derivan.
- **Bases fieles al preajuste**: al partir de un preajuste se copian sus 14 anclas
  en ambos modos y se conserva su rasgo de borde grueso (por ejemplo, MX Brutalist).
- **Temas con nombre**: guarda con un nombre, cambia en **Mis temas** con el activo
  marcado y usa **Gestionar** para seleccionar varios, eliminar o exportar.
- **Importar/exportar JSON**: exporta un tema o un paquete a `.json`; importa
  pegando JSON o eligiendo un archivo. El diálogo incluye un ejemplo comentado y
  los temas importados aparecen en **Mis temas** con el `name` del JSON.
- **Fuentes**: pilas independientes para latín, chino y código. Cada menú incluye
  los preajustes y las **fuentes leídas de este equipo** (`Local ·`), con opción de
  ocultarlas y **Detectar fuentes locales**; se permiten duplicados.
- **Tamaño del texto**: 10–22 px mediante el servicio de tema nativo; se conserva al
  recargar.
- **Ocho idiomas**: chino simplificado, inglés, japonés, español, francés, alemán,
  ruso y portugués de Brasil.
- **Persistencia tras reiniciar**: los ajustes se guardan en el documento de
  configuración del Host de DSH.

## Referencia de paletas

![Hoja de referencia de paletas](research/preview.png)

## Instalación

### Discover (recomendado)

1. Abre **Plugins → Discover**.
2. Añade esta fuente de índice:

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.5.0/market/index.json
   ```

3. Busca **DSH Theme**, abre su ficha y pulsa **Install**.

El índice está fijado al commit de Git de 1.5.0. La misma versión se publica en npm
como `@solvashq/dsh-theme@1.5.0`, y el GitHub Release incluye `dsh-theme.tgz`.

### npm

```bash
npm install @solvashq/dsh-theme
```

También puedes pedir a tu agente de DSH que instale
`@solvashq/dsh-theme@1.5.0`.

### Desde el código fuente

```bash
git clone https://github.com/SolvasHQ/dsh-theme.git
cd dsh-theme
pnpm install --prod
```

Enlaza el directorio en la lista de bundles de tu perfil de DSH (mejor con Plugin
Manager usando la ruta absoluta), ejecuta `pnpm install` dentro del perfil y
reinicia DSH.

## Compatibilidad

Probado con DeepSeek Harness de escritorio `0.2.2-rc.1` (Web GUI); la línea
0.2.1-rc.2 sigue funcionando. El plugin usa solo las extensiones públicas del
cliente (`slots`, `theme`, `locale`, `configForms`) y la configuración volatile del
Host.

## Créditos de paletas

Catppuccin, Nord, Gruvbox y Tokyo Night son paletas de sus respectivos autores. Se
usan como referencia de color, adaptadas a las 14 anclas de DSH con ajustes de
contraste; los enlaces están en `research/palettes.json` bajo `sources` y se aplica
la licencia de cada proyecto.

## Licencia

MIT — consulta [LICENSE](LICENSE).

[Registro de cambios](CHANGELOG.md) · [Problemas](https://github.com/SolvasHQ/dsh-theme/issues)
