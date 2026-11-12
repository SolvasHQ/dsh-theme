# Thème DSH

[简体中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md) | [Español](README.es.md) | **Français** | [Deutsch](README.de.md) | [Русский](README.ru.md) | [Português](README.pt.md)

[![verify](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml/badge.svg)](https://github.com/SolvasHQ/dsh-theme/actions/workflows/verify.yml)
[![npm](https://img.shields.io/npm/v/@solvashq/dsh-theme.svg)](https://www.npmjs.com/package/@solvashq/dsh-theme)
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40solvashq%2Fdsh-theme.json%3Flang%3Den)](https://dshopen.org/plugins/@solvashq/dsh-theme/)
[![awesome-dsh-plugin](https://img.shields.io/badge/awesome--dsh--plugin-listed-7c3aed)](https://awesome-dsh-plugin.com/p/SolvasHQ/dsh-theme/)

Palettes de thème, éditeur de couleurs DIY complet, bibliothèque de thèmes
personnalisés nommés, polices locales et taille du texte pour l’interface web de
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). S’ouvre depuis
l’icône de palette en bas à gauche de la barre latérale.

Clair et sombre sont traités à égalité : chaque préréglage et chaque couleur DIY
possède une valeur pour les deux modes, y compris lorsque l’apparence système passe
de clair à sombre ou à automatique.

## Captures

L’interface anglaise est affichée ici ; le README chinois utilise des captures en
chinois. Les autres langues partagent la même disposition.

| Panneau principal | Éditeur de thème personnalisé |
|:---:|:---:|
| <img src="docs/screenshots/panel-en.png" width="310" alt="Panneau anglais avec 14 préréglages"> | <img src="docs/screenshots/panel-en-custom.png" width="310" alt="Éditeur personnalisé anglais avec échantillons de base et champs de couleur"> |

**Réglages → Thème**

<img src="docs/screenshots/settings-en.png" width="560" alt="Page Thème dans l’interface anglaise">

**Entrée** : l’icône de palette en **bas à gauche de la barre latérale**, sur la
ligne au-dessus de Réglages. La même page existe dans **Réglages → Thème**.

## Fonctionnalités

- **14 préréglages** : Par défaut, Chaud, Mono, Claude, Claude+, Vermillon, Ambre
  Mono, MX Brutalist, Tiesen, Vescrow, **Catppuccin, Nord, Gruvbox et Tokyo Night**,
  plus une carte **Personnalisé**.
- **Éditeur DIY** : par mode clair/sombre, fond, carte, fenêtre, barre latérale,
  texte, bordure et accent du mode ; les couleurs d’état sont enregistrées par mode ;
  interrupteur **Bordures épaisses**. Les champs non modifiés sont dérivés.
- **Bases fidèles au préréglage** : partir d’un préréglage copie ses 14 ancres dans
  les deux modes et conserve son trait de bordure épaisse (par exemple MX Brutalist).
- **Thèmes nommés** : enregistrez sous un nom, basculez dans **Mes thèmes** avec le
  thème actif coché, puis **Gérer** pour sélectionner, supprimer ou exporter.
- **Import/export JSON** : exportez un thème ou un pack en `.json` ; importez en
  collant du JSON ou en choisissant un fichier. La boîte de dialogue contient un
  exemple commenté et les thèmes importés apparaissent dans **Mes thèmes** avec le
  `name` du JSON.
- **Polices** : piles latine, chinoise et code indépendantes. Chaque menu propose
  les préréglages et les **polices lues sur cette machine** (`Locale ·`), avec
  possibilité de les masquer et **Détecter les polices locales** ; les doublons
  sont autorisés.
- **Taille du texte** : 10–22 px via le service de thème natif, conservée au
  rechargement.
- **Huit langues** : chinois simplifié, anglais, japonais, espagnol, français,
  allemand, russe et portugais du Brésil.
- **Persistance après redémarrage** : les choix sont stockés dans le document de
  configuration Host de DSH.

## Référence des palettes

![Planche de référence des palettes](research/preview.png)

## Installation

### Discover (recommandé)

1. Ouvrez **Plugins → Discover**.
2. Ajoutez cette source d’index :

   ```
   https://cdn.jsdelivr.net/gh/SolvasHQ/dsh-theme@v1.5.0/market/index.json
   ```

3. Cherchez **DSH Theme**, ouvrez sa fiche et cliquez sur **Install**.

L’index est épinglé au commit Git de la 1.5.0. La même version est publiée sur npm
sous `@solvashq/dsh-theme@1.5.0`, et le GitHub Release fournit `dsh-theme.tgz`.

### npm

```bash
npm install @solvashq/dsh-theme
```

Vous pouvez aussi demander à votre agent DSH d’installer
`@solvashq/dsh-theme@1.5.0`.

### Depuis les sources

```bash
git clone https://github.com/SolvasHQ/dsh-theme.git
cd dsh-theme
pnpm install --prod
```

Liez le dossier dans la liste de bundles de votre profil DSH (de préférence via
Plugin Manager avec le chemin absolu), lancez `pnpm install` dans le profil puis
redémarrez DSH.

## Compatibilité

Testé avec DeepSeek Harness bureau `0.2.2-rc.1` (Web GUI) ; la série 0.2.1-rc.2
fonctionne toujours. Le plugin n’utilise que les points d’extension publics du
client (`slots`, `theme`, `locale`, `configForms`) et la configuration volatile du
Host.

## Crédits des palettes

Catppuccin, Nord, Gruvbox et Tokyo Night sont des palettes communautaires de leurs
auteurs respectifs. Elles servent de références colorimétriques, adaptées aux 14
ancres de DSH avec des ajustements de contraste ; les liens figurent dans
`research/palettes.json` sous `sources`, et la licence de chaque projet s’applique.

## Licence

MIT — voir [LICENSE](LICENSE).

[Journal des modifications](CHANGELOG.md) · [Problèmes](https://github.com/SolvasHQ/dsh-theme/issues)
