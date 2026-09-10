# ÉTAT DE RÉFÉRENCE — RÉSONANCE Bloc 5 (2026-09-09)

Bloc 1 + Bloc 2 validés en jeu. Bloc 3 VALIDÉ ET FIGÉ. Bloc 4 VALIDÉ BOUT-EN-BOUT. Bloc 5 implémenté : 84 PASS + E2E 14/14 + build OK, en attente de ta validation jouable.

Stack inchangée, zéro dépendance. IA hors socle. Aucun score/profil/diagnostic nulle part.

## Fichiers modifiés (additifs uniquement)
- server/src/index.js : tables parcours/espaces/situations/choix/parties/reponses + seed démo, helpers ordre/situation/partie, routes /api/parties|/parties/:id|/choisir|/interrompre|/reprendre + /api/memoire, exports + /me/data + /me étendus aux parties (nécessité : sinon données utilisateur survivantes).
- server/config.json : bloc5-1.0. server/package.json : test:bloc5, test inclut bloc5.
- client/src/lib/api.ts (+parties/memoire), client/src/Parcours.tsx (nouveau), client/src/App.tsx (onglet Parcours + Mémoire du parcours au carnet).

## Fichiers créés
- client/src/Parcours.tsx, server/tests/bloc5.test.js.

## Migrations (auto)
parcours, espaces, situations, choix, parties (user_id nullable, mécanisme Bloc 4), reponses (snapshots titre/texte/choix/fragment + position + date). Seed : « Première traversée (démo) », 2 espaces (Le seuil ×2 situations, Le chemin ×1), 3 choix/situation avec fragment.

## Fonctionnalités
Nouvelle partie anonyme ou rattachée si connecté (compte jamais obligatoire) ; situation courante seule (futur jamais révélé, pas de total) ; choisir → enregistre partie/situation/choix/espace/position/date ; interruption (en_pause, choix 409) / reprise exacte / terminée ; mémoire = choix + fragments (passé seul) affichée au carnet + exports JSON/HTML ; matière conservée pour émergence future, sans calcul.

## Tests : 84 PASS + E2E 14/14 / 0 FAIL + build OK
bloc3 25/25, delete 13/13, bloc4 25/25, bloc5 21/21, e2e 14/14.
## Reste à valider par toi
NOUVELLE PARTIE → SITUATION → CHOIX → SUIVANTE → QUITTER → REVENIR → REPRENDRE → CARNET, avec et sans compte.
