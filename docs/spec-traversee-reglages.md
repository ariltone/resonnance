# Spec — Traversée en 3 temps + Réglages (validée sur principe, non implémentée)

Date : 12 septembre 2026. Statut : IMPLÉMENTÉ le 12 septembre 2026 (Bloc 7 : 19 tests verts).
Règle d'or : aucun commit avant accord.

## 1. Boucle de jeu « Traversée »

1. Une phrase d'ouverture (texte du corpus, tirage aléatoire uniforme).
2. Un tirage de `taille_tirage` photos (défaut 6) en résonance **partielle** avec la phrase,
   dont une part `decalage` (défaut 1/6) sans rapport volontaire — jamais d'illustration.
3. Le joueur marque 1 image (choisie) ou N images (consigne répulsion : écartées).
4. Répéter 3 fois (`nombre_tours`, défaut 3) → proposition « voir le carnet ».
5. Carnet de traversée : uniquement les images marquées (les 3), pas tout le tirage.
6. Zone d'écriture unique, trois questions ouvertes et optionnelles + silence toujours possible :
   « Qu'est-ce que cet enchaînement d'images te dit ? »
   « Quel mot mettrais-tu dessus ? »
   « Qu'est-ce que cela éveille ? » (formulation prudente, pas « quelle partie de ta vie »).
7. Sorties : « nouveau tirage » (complète la traversée si < 3 tours, sinon nouvelle traversée),
   « écrire au carnet » (dépose/modifie la parole différée), « nouvelle partie » (nouvelle traversée).

Tous les comptes (`taille_tirage`, `nombre_tours`, `decalage`) sont configurables (voir §2),
jamais codés en dur.

## 2. Menu Réglages (nouveau)

Remplace l'onglet « Photothèque » isolé (qui y déménage) et l'onglet « Parcours » (déjà masqué).
Sections :

- **Rythme** : `taille_tirage`, `nombre_tours`, `decalage`, part de `hasard`, `plafond_intensite`.
  Stockage : table `configs_editoriales` existante (versions immuables, retour possible).
  Règles doctrinales (non-réécriture, tags multiples, silence) : non configurables.
- **Photothèque** : l'admin existante, déplacée telle quelle.
- **Phrases** : liste des textes (contenu, famille en liste fermée :
  évocation, tension, choix, déplacement, projection, statut), ajout, modification, archivage.
  Suppression dure refusée (409) si citée dans un carnet. Modifications prospectives uniquement
  (les carnets passés sont snapshotés).
  Aide à l'écriture (avertissements, jamais blocages) : détection du « tu », des personnages-fable,
  compteur 8–22 mots, rappel image concrète / déplacement muet.

## 3. Retours et silence

- Flèches de retour **intra-séquence uniquement** (tirage ↔ phrase, carnet ↔ tirage en cours).
  Jamais de réécriture du passé : un choix est modifiable tant que la séquence est ouverte ;
  une fois déposée, seule la parole différée s'ajoute.
- Silence conservé comme contenu (§22, déjà compté en signaux). Rythmé par une pause
  (« Garde-la un instant ») **avant** l'invitation à écrire, jamais en concurrence avec elle.

## 4. Données et routes (minimal)

- Une colonne `traversee` (TEXT, nullable) sur `sequences` : relie les 3 séquences d'une traversée.
  Zéro table nouvelle, zéro moteur nouveau. Carnet : filtre « dernière traversée ».
- Réutiliser le moteur de parties (Bloc 5, dormant) si un conteneur « nouvelle partie » s'avère
  nécessaire — ne pas reconstruire un second système.
- Boucle 3 temps : réutilise `POST /api/session/new`, `/statut`, `/expression`, carnet existants.

## 5. Non-objectifs (refusés)

- Photos « en rapport » illustratif avec la phrase (§16–18) ; disponibilité/humeur comme paramètre
  (questions supprimées) ; toute interprétation IA (niveau 4, garde-fous 6.8 inchangés) ;
  personnages-fables et maximes dans les phrases (grille §6.1).
