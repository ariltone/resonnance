# RÉSONANCE — Spec produit claire (relecture du 12 septembre 2026)

> Ce document remplace l'éparpillement des 7 cahiers pour le pilotage quotidien.
> Les cahiers restent la référence doctrinale ; en cas de conflit, la **décision datée
> du propriétaire** (rappelée ci-dessous) prime, puis la doctrine.

## 1. Le produit en une phrase

Traversée en 3 temps : **une phrase d'ouverture → 6 photos → 1 image marquée d'un seul
geste → pause → ×3 → carnet des 3 + écrit unique (3 questions, silence possible)**.
Le joueur donne le sens ; l'application compose la rencontre, jamais l'interprétation.

## 2. Décisions propriétaires qui s'écartent des cahiers (assumées, datées 11–12 sept. 2026)

| # | Cahier d'origine | Décision actuelle |
|---|------------------|-------------------|
| 1 | Portes d'entrée « J'ai une question / Je ne sais pas » + « Comment arrives-tu » (concept §4, §21) | **Supprimées** de l'interface. L'API les accepte encore (vide), le tirage ne les utilise pas. |
| 2 | Choix modifiable (concept §5) | **Choix définitif** : premier geste, sans retour (parti-pris intuitif). |
| 3 | Questions voir/ressentir/évoque après chaque choix (concept §7, règles §9) | **Déplacées** : écrit unique différé au carnet de traversée (mot / enchaînement / éveil + silence). |
| 4 | Parcours narratif Bloc 5 (3 situations écrites) | **Onglet masqué**, moteur conservé. Contredit la non-prescription (fragments imposés). |
| 5 | Séquence libre, rejouable à l'infini | **Traversée fermée en 3 tours** (configurable), carnet par traversée. |
| 6 | Tags `peur`, `relation`, `rupture` au référentiel | **Sans photo** (corpus de 50 ne les utilise pas). En attente : archiver ou rattacher. |

## 3. Contenu actuel (vérifié)

- **50 photos** N&B locales (`R001–R050`), domaine public vérifié, 2–4 tags chacune
  (14 champs actifs), intensités 1/2/3, catégories existantes uniquement.
- **20 phrases d'ouverture**, grille atelier validée (§6.1 du moteur éditorial) : 0 « tu »,
  0 fable, 7–14 mots, familles en liste fermée.
- Photothèque active = 50/50 ; tout le reste est archivé ou supprimé ; historique purgé
  (données du propriétaire préservées).

## 4. Socle technique (vérifié)

- API Express + SQLite (WAL), zéro dépendance lourde ; moteur de tirage pur et testé
  (diversité + hasard + anti-récents + part de décalage) ; journal append-only ;
  signaux, récurrences, progression, carnet 3 niveaux, garde-fous IA (niveau 0 = absente).
- **257 tests verts** (15 suites) + build client OK. Pas de tests client automatisés.
- Config en base versionnée (`configs_editoriales`) : taille_tirage / nombre_tours / décalage
  réglables sans code, via menu Réglages (Rythme / Phrases / Photothèque).

## 5. Ce qu'il reste à faire (ordre proposé)

1. **Jouer pour de vrai** : valider le rythme (6/3/1 par défaut) via Réglages ; noter.
2. **Tags orphelins** : archiver `peur, relation, rupture` ou y rattacher des photos (décision).
3. **Divergences docs** : resynchroniser `contenu et moteur éditoriale.odt` (§6.1 ajouté
   seulement au `.md`) ; clarifier qui a réécrit `app/ETAT_REFERENCE.md` le 11/09 à 14h08.
4. **Graine base vide** : le code replante 12 démos picsum si la base est recréée —
   contradictoire avec la doctrine « 50 seules ». À neutraliser ou assumer.
5. **« Je suis »** (règles §18, IA §24-25) : formulation joueur du moment — non implémenté.
6. **Modes de séance** (miroir, contraste, retour, évitement…) : un seul mode (traversée).
7. **Carnet** : seule la vue chrono existe (thématique, photographique, miroir, synthèse : non).
8. **IA générative** (niveaux 1–4) : explicitement reportée par le propriétaire. Socle prêt
   (garde-fous + traçabilité), génération « à spécifier ».
9. **Design** : identité/logo, animations fonctionnelles, son (optionnel), passe mobile réelle.
10. **Juridique** : document RGPD/confidentialité annoncé par les cahiers, absent.
11. **Commit** : ~70 entrées en attente (corpus, Bloc 7, adaptations de tests, suppressions
    de démos). Relecture + commit par lots quand décidé.

## 6. Règles de pilotage (inchangées)

- Aucune interprétation imposée ; tags et résonances = possibilités, jamais des sens.
- On ajoute, on ne réécrit pas (historique, carnets, configs versionnées).
- Comptes configurables, jamais codés en dur ; doctrine non configurable.
- Aucun commit/push sans accord explicite.

## 7. Grille des respirations (atelier validé le 11 septembre 2026, rapatriée ici)

Climat unique Thomas + Jung + Osho (regarder → déplacer → laisser ouvert).

1. **Non-récit** : objets, lieux, matières seulement, aucun personnage.
2. **Non-maxime** : ni morale, ni conseil, ni explication ; pas de développement personnel.
3. **Monde-sans-tu** : la phrase parle du monde, jamais directement au joueur.
4. **Déplacement muet** : un petit déplacement senti par l'image, jamais formulé.
   Une phrase, 8–22 mots, image concrète, capable de survivre au silence.
