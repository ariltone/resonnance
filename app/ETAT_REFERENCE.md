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

---

# BLOC 6.1 — modèle éditorial (NON COMMITÉ, en attente de validation humaine)

Matière structurée pour le futur moteur. Aucune logique de sélection, aucun scoring, aucun frontend modifié.

## Fichiers modifiés (additifs uniquement)
- server/src/index.js : section « Bloc 6.1 » (migrations + helpers + routes, ~200 lignes, avant `const PORT`).
- server/config.json : version bloc5-1.0 → bloc6.1-1.0 (tracée sur les nouvelles séquences via config_version).
- server/package.json : script test:bloc61, inclus dans test.

## Fichiers créés
- server/tests/bloc6-1.test.js (30 tests).

## Base de données (migrations auto au boot, compatibles Bloc 5)
- Nouvelles tables : stimuli (cle stable UNIQUE type-refId, 1 seule référence parmi image/texte/question via CHECK, intensité 1-3, variante_de, statut, version), stimulus_phases (M2M), phases (référentiel seed : accueil/exploration/expression/cloture), questions (type libre, formulation, intensité, variante_de, statut, ordre, version), configs_editoriales (UNIQUE nom+version, parametres JSON, versions immuables).
- Colonnes ajoutées (ALTER try/catch, NULL/défaut) : texts.statut/intensite/version/variante_de, images.intensite, sequences.config_editoriale_id, parties.config_editoriale_id.
- Seed : config « defaut » v1 = miroir du tirage config.json.

## API (base propre, pas d'admin complète)
- Admin : /api/admin/phases|questions|stimuli|configs (GET/POST/PATCH ; PATCH configs = statut seul ; type/référence stimulus immuables).
- Lecture : GET /api/editorial/disponibles?type=&phase= (actifs uniquement à tous les niveaux).
- Règles : type/référence cohérents, variante même type, phases actives, 1 stimulus par contenu, phase d'un stimulus sans phase = compatible partout.

## Tests : 114 PASS / 0 FAIL + E2E PASS
bloc3 25/25, delete 13/13, bloc4 25/25, bloc5 21/21, bloc6-1 30/30 (rejoints, inactifs exclus, variantes, phases, configs, compat Bloc 5, nettoyage par archivage), e2e PASS.

---

# BLOC 6.2 — historique & mémoire (NON COMMITÉ, en attente de validation humaine)

Journal append-only de faits Niveau 1 (cf. cahier IA §5 : observation affirmable, jamais d'hypothèse). Aucune logique d'exploitation, aucun frontend modifié, Bloc 5 non réécrit.

## Fichiers modifiés (additifs uniquement)
- server/src/index.js : section « Bloc 6.2 » (table + helpers + 3 lectures) + 8 points de capture dans les routes existantes + 2 DELETE dans effacerDonneesUtilisateur (cohérence suppression RGPD) + champ additif config_editoriale_id dans partieState.
- server/package.json : script test:bloc62, inclus dans test.

## Fichiers créés
- server/tests/bloc6-2.test.js (24 tests).

## Modèle
- Table `evenements` (id, created_at, partie_id NULL, sequence_id NULL, type parmi presente/vue/choisie/choix_retire/rejetee/expression/reponse, image_id, stimulus_id, position, details JSON, config_version, config_editoriale_id). Types extensibles via constante, pas de CHECK rigide.
- Capture : session/new → N 'presente' (deja_vue + fantome distingués, stimulus lié si enveloppé) ; choix → 'choix_retire' puis 'choisie' ; statut → événement du statut ; expression → 'expression' {silence} sans le texte ; parties/choisir → 'reponse' avec snapshot {situation/choix/fragment} ; créations séquence/partie snapshotent config_editoriale_id (defaut active max, NULL si aucune).
- Lectures : GET /api/session/:id/evenements (même accès que carnet), GET /api/parties/:id/historique (état + événements + reponses snapshotées Bloc 5), GET /api/editorial/rencontres?image_id= (agrégats vues/choix/rejets/revisites/premier/dernier/séquences, sans user_id ni texte).
- Dérivés laissés au futur moteur (documentés) : ignoré = présenté sans suite ; choisi ultérieurement = choisie après présentation antérieure ; répétition provoquée = fantome/deja_vue.

## Tests : 138 PASS / 0 FAIL + E2E PASS
bloc3 25/25, delete 13/13, bloc4 25/25, bloc5 21/21, bloc6-1 30/30, bloc6-2 24/24 (ordre, non-réécriture, rejet, silence hors journal, revisite, rencontres sans fuite, snapshot partie, pause/reprise, purge cascade, SANS_SCORE partout), e2e PASS. Stable sur 3 passages.

---

# BLOC 6.3 — moteur de tirage (NON COMMITÉ, en attente de validation humaine)

Sélection éditoriale sans signification imposée (recettes F-020 à F-023). Fantômes Bloc 2 conservés tels quels, route et réponses HTTP inchangées, aucun frontend modifié.

## Fichiers créés
- server/src/moteur-tirage.js : service pur (graineAleatoire, hasardControle/mulberry32, melanger, composerTirage). Aucune pondération exposée/stockée/affichée.
- server/tests/moteur-tirage.test.js (17 tests unitaires déterministes).
- server/tests/bloc6-3.test.js (10 tests d'intégration).

## Fichiers modifiés (additifs uniquement)
- server/src/index.js : import moteur + remplacement du `sort aléatoire + slice` par `composerTirage` (candidats enrichis catégorie/intensité image+stimulus, récents = dernière séquence, config = params « defaut », contexte texte transmis) + helper configMoteurParams().
- server/package.json : scripts test:moteur, test:bloc63, inclus dans test.

## Moteur
Disponibles actifs re-vérifiés → intensité max → compatibilités explicites (défaut neutre, 'exclue' écarté) → exclusion récents avec repli (jamais de panne) → part hasard (mulberry32 seedé en test, Math.random en prod) + complément glouton diversité catégorielle → ordre final brassé (aucune « bonne réponse »). Imposés (fantômes) comptés sans doublons. Clés config inconnues ignorées (composition 4/2/1 = blocs suivants).

## Tests : 165 PASS / 0 FAIL + E2E PASS
bloc3 25, delete 13, bloc4 25, bloc5 21, bloc6-1 30, bloc6-2 24, moteur 17, bloc6-3 10, e2e PASS. Nouveaux tests stables sur 2 passages.

---

# BLOCS 6.4 → 6.8 — Signaux → Événements → Progression → Carnet → IA (NON COMMITÉS, validation humaine requise)

Ensemble cohérent, séparé par module préfixé du n° de bloc. Aucune mécanique inventée : chaque fonction cite sa source. Frontend untouched. Aucun commit/push/reset.

## 6.4 Signaux — `src/signaux.js` + GET /api/session/:id/signaux + GET /api/parties/:id/signaux
Délais (premier choix, expression, réponse) + comptes (présentées/choisies/retirées/rejetées/revisitées/silences/réponses) dérivés du journal 6.2, rien de stocké, `nature: 'observation'`, n'influence rien (cahier-technique §11).

## 6.5 Événements — `src/recurrences.js` + GET /api/editorial/recurrences
Échelle cahier-IA §12 (ponctuel/répétition/significatif/fort, seuils paramétrables via config `seuils_recurrence`), `provoquee` distingué par fantôme (moteur §44), sources tracées (§36), intervention = possibilité, aucun effet moteur.

## 6.6 Progression — `src/progression.js` + GET /api/progression
Compteur de séquences seul (règles §16, pas de niveaux chiffrés), 6 phases nominatives §31, plafond d'intensité progressif §33, paliers configurables `paliers_phase` (défauts techniques [3,6,10,15,21] à valider).

## 6.7 Carnet — GET /api/carnet/complet (entrées existantes inchangées)
3 niveaux règles §32 (faits / parole_joueur / propositions_systeme), récurrences 6.5 non-ponctuelles, questions ouvertes §17. Manque signalé non inventé : marquage « à revenir » inexistant.

## 6.8 IA hors socle — `src/garde-fous-ia.js` + GET /api/ia/statut
Contrôle §37 sur exemples interdits explicites (§13/15/16/17/22/23), anti-hallucination §35 (histoire minimale §20), niveau configurable §38 (défaut 0 = absente). Génération explicitement « à spécifier ».

## Tests : 236 PASS / 0 FAIL + E2E PASS
Anciens inchangés et verts (165). Nouveaux : 6.4×13, 6.5×15, 6.6×10, 6.7×9, 6.8×18, intégration-6x×6 (chaîne complète, pas de boucle choix→profil→interprétation).
