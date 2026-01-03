# car-a-day

[![tests](https://github.com/MaxLepan/car-a-day/actions/workflows/tests.yml/badge.svg)](https://github.com/MaxLepan/car-a-day/actions/workflows/tests.yml)

Jeu quotidien type Wordle/Pedantix autour des voitures, en deux modes :

- EASY : deviner un modèle (CarModel), ex : Renault Clio
- HARD : deviner une variante (CarVariant), ex : Renault Clio TCe 100 Manuelle Essence

Chaque jour, deux cibles differentes (easy et hard) sont générées de facon déterministe.

## Stack

- Frontend : Angular (TypeScript, strict)
- Backend : Node.js + Express (TypeScript)
- DB : SQLite + Prisma
- Monorepo npm workspaces

## Structure du repo

```bash
apps/
  api/        API Express (TypeScript)
  web/        Front Angular
packages/
  shared/     Types et contrats partages
```

## Prerequis

- Node.js 20 LTS
- npm 9+

## Installation

```bash
npm install
```

## Configuration

API : `apps/api/.env`

```bash
DATABASE_URL="file:./dev.db"
```

## Base de donnees (Prisma)

Appliquer les migrations et seed :

```bash
npx --workspace apps/api prisma migrate dev
npx --workspace apps/api prisma generate
npx --workspace apps/api prisma db seed
```

## Lancer en dev

Depuis la racine :

```bash
npm run dev
```

- Front : <http://localhost:4200>
- API : <http://localhost:3000>

## Scripts utiles

```bash
npm run dev
npm run dev:web
npm run dev:api
npm run build
```

## API (résumé)

- `GET /puzzle/today?mode=easy|hard`
- `GET /search/models?q=term`
- `GET /search/variants?q=term`
- `POST /guess?mode=easy|hard`

## Notes

- Le backend calcule le feedback.
- Le frontend stocke les tentatives en localStorage par date et mode.
- Pas d'authentification.

## TODO

Classés par priorité :

- ~~Afficher la voiture du jour précédent~~
- ~~Ajouter traductions (i18n)~~
- ~~Ajouter des tests (frontend et backend)~~
- Ajouter des informations sur les voitures du jour (depuis Wikipédia ?)
- Améliorer les recherches (ex : fuzzy search)
- Améliorer le design
  - Design sérieux
  - Animations de victoire
  - Responsive
  - Thème sombre
  - Meilleure UI pour les recherches
- Ajouter un indice pour le Hard si Easy est trouvé
- Ajouter le fonctionnement et les règles (page séparée ou modal)
- Ajouter plus de données voitures
- Déployer pour accès public
