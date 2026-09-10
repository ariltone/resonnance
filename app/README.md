# RÉSONANCE — socle Bloc 1

Stack : React + Vite + TypeScript + Node.js (Express) + SQLite (node:sqlite). Migrable Postgres.
IA volontairement absente du socle.

## Lancer
Terminal 1 — API :
```
cd app/server
npm install
npm run dev
# http://localhost:3001/api/health
```
Terminal 2 — Jeu :
```
cd app/client
npm install
npm run dev
# http://localhost:5173
```

## Parcours Bloc 1 (minimal jouable)
Accueil (Comment arrives-tu ? + J'ai une question / Je ne sais pas) → Texte → Tirage 6 images (config.json) → Choix intuitif unique modifiable → Expression (voir / ressentir / évoque + silence autorisé) → Carnet chronologique.

## Config (sans coder)
`app/server/config.json` : version, tirage.nombre_images, consigne, questions_expression.

## API
POST /api/session/new, POST /api/session/:id/choix, POST /api/session/:id/expression, GET /api/carnet, GET /api/images, GET /api/config.

## Règles respectées
Joueur souverain, pas de diagnostic, texte original immuable, observation ≠ donnée, silence autorisé.
