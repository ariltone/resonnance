# Cahier des charges technique — RÉSONANCE

> Version lisible sur GitHub du fichier source : `Cahier des charges technique — RÉSONANCE.pdf` (conservé à la racine du dépôt).

---

CAHIER DES CHARGES TECHNIQUE
RÉSONANCE
Application d'exploration personnelle par photolangage, carnet et IA
1. OBJET DU PROJET
RÉSONANCE est une application interactive d'exploration personnelle basée sur :
le photolangage ;
la sélection intuitive d'images ;
le questionnement ;
l'expression libre ;
la conservation des expériences dans un carnet ;
l'analyse longitudinale par intelligence artificielle ;
l'identification de récurrences, évolutions et contradictions ;
une interaction continue entre le joueur et son propre historique.
Le système doit être conçu comme une plateforme configurable, et non comme une expérience figée
dans le code.
Une grande partie des règles de fonctionnement doit donc pouvoir être modifiée par l'administrateur
sans intervention d'un développeur .
2. PRINCIPES TECHNIQUES FONDAMENTAUX
L'architecture doit respecter les principes suivants :
2.1 Séparation des responsabilités
Séparer clairement :
les données du joueur ;
les contenus éditoriaux ;
les règles du jeu ;
les paramètres de configuration ;
les données issues des interactions ;
les analyses IA ;
les validations ou refus du joueur .
2.2 Aucune interprétation ne doit remplacer la donnée originale
Le texte écrit par le joueur doit toujours être conservé tel quel.
•
•
•
•
•
•
•
•
1.
2.
3.
4.
5.
6.
7.
1

---

Une analyse IA est une donnée supplémentaire.
Elle ne modifie jamais le contenu original.
2.3 Les comportements variables ne doivent pas être codés en dur
Exemple :
Le nombre de photos d'un tirage doit être une configuration.
Il ne doit pas être fixé définitivement dans le programme.
Même principe pour :
la fréquence des retours d'images ;
la quantité de hasard ;
les seuils de récurrence ;
la fréquence des analyses IA ;
la profondeur des séances ;
etc.
3. ARCHITECTURE FONCTIONNELLE GLOBALE
Le système repose sur les composants suivants :
UTILISATEUR
    │
    ▼
PROFIL
    │
    ▼
MOTEUR DE SÉANCE
    │
    ├──────────────► QUESTIONS
    │
    ├──────────────► MOTEUR DE TIRAGE
    │                       │
    │                       ▼
    │                  PHOTOTHÈQUE
    │
    ▼
INTERACTIONS
    │
    ▼
RÉPONSES
    │
    ▼
CARNET
•
•
•
•
•
•
2

---

│
    ▼
MOTEUR D'ANALYSE
    │
    ▼
IA
    │
    ▼
OBSERVATIONS
    │
    ▼
RÉACTION DU JOUEUR
    │
    ▼
CARNET
Un système transversal de configuration contrôle le comportement de l'ensemble.
4. UTILISATEURS ET PROFILS
Chaque utilisateur dispose d'un profil.
Données principales :
identifiant ;
informations d'authentification ;
date de création ;
dernière activité ;
préférences personnelles ;
paramètres d'expérience ;
historique des séances ;
carnet.
Toutes les données personnelles et les contenus du carnet sont privés par défaut.
5. PHOTOTHÈQUE
La photographie constitue le premier type de « stimulus » du système.
Une photo possède notamment :
identifiant ;
fichier ;
statut ;
titre interne ;
description interne ;
•
•
•
•
•
•
•
•
•
•
•
•
•
3

---

source ;
droits d'utilisation ;
date d'intégration ;
métadonnées projectives ;
catégories ;
tags ;
niveau de disponibilité.
Les informations éditoriales internes ne sont jamais nécessairement visibles par le joueur .
6. MÉTADONNÉES PROJECTIVES
Chaque image peut être caractérisée selon plusieurs dimensions.
Exemples :
présence humaine ;
nombre de personnes ;
isolement ;
proximité ;
distance ;
mouvement ;
immobilité ;
ouverture ;
fermeture ;
attente ;
départ ;
arrivée ;
tension ;
apaisement ;
ambiguïté ;
étrangeté ;
vulnérabilité ;
confrontation ;
protection ;
transformation.
Une photographie peut posséder plusieurs caractéristiques simultanément.
Ces métadonnées servent au moteur de sélection et à l'analyse.
Elles ne constituent jamais une interprétation psychologique du joueur .
7. TAXONOMIE DES IMAGES
La photothèque doit pouvoir être organisée selon plusieurs niveaux.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
4

---

Nature du stimulus
humain ;
animal ;
objet ;
architecture ;
nature ;
paysage ;
abstraction ;
situation.
Situation
seul ;
duo ;
groupe ;
rencontre ;
séparation ;
attente ;
déplacement ;
immobilité.
Espace
intérieur ;
extérieur ;
seuil ;
espace fermé ;
espace ouvert ;
espace intermédiaire.
Qualités projectives
ambigu ;
mystérieux ;
rassurant ;
inquiétant ;
contradictoire ;
surprenant ;
émotionnellement neutre.
La taxonomie doit rester évolutive.
8. MOTEUR DE TIRAGE
Le tirage doit combiner :
hasard ;
diversité ;
historique du joueur ;
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
5

---

images déjà vues ;
images choisies ;
images rejetées ;
images récemment utilisées ;
métadonnées ;
type de séance ;
paramètres personnels ;
paramètres administrateur .
Le tirage ne doit donc pas être un simple tirage aléatoire pur .
9. COMPOSITION D'UN TIRAGE
Le moteur doit pouvoir composer un tirage selon une règle configurable.
Exemple :
7 images
4 nouvelles
2 liées à l'historique
1 image de contraste
Ces valeurs sont des exemples.
Elles doivent être modifiables depuis l'administration.
Le système doit également permettre d'utiliser d'autres stratégies.
10. HISTORIQUE DES INTERACTIONS
Toutes les interactions importantes doivent être enregistrées.
Exemple :
Séance 24
Image A → vue → rejetée
Image B → vue → rejetée
Image C → vue → choisie
Image D → vue → rejetée
Image E → vue → choisie → retirée
•
•
•
•
•
•
•
•
6

---

Le système conserve notamment :
ordre de présentation ;
ordre des choix ;
images regardées ;
images rejetées ;
images sélectionnées ;
changements de choix ;
retour vers une image ;
abandon éventuel.
Ces données constituent l'historique objectif du parcours.
11. DONNÉES TEMPORELLES
Le système peut enregistrer certains indicateurs temporels d'interaction.
Par exemple :
durée approximative d'exposition ;
temps avant sélection ;
temps avant abandon ;
retour sur une image.
Ces données doivent être considérées comme des signaux comportementaux, jamais comme des
preuves psychologiques.
Elles peuvent être désactivées ou exclues de l'analyse selon la configuration.
12. MODES DE SÉANCE
Le moteur doit supporter plusieurs types de séances.
Séance libre
Aucune question préalable.
Séance avec question
Le joueur formule une problématique.
Séance miroir
Le système part d'une observation issue du carnet.
•
•
•
•
•
•
•
•
•
•
•
•
7

---

Séance contraste
Le joueur est confronté à des images volontairement différentes.
Séance retour
Une image ou une situation ancienne revient.
Séance évitement
Le système explore les images régulièrement rejetées.
Séance évolution
Comparaison entre différentes périodes.
Séance synthèse
Analyse globale du parcours.
Les modes doivent pouvoir être activés ou désactivés depuis l'administration.
13. QUESTIONS
Les questions sont des objets éditoriaux indépendants.
Une question peut posséder :
identifiant ;
texte ;
catégorie ;
mode de séance ;
niveau de profondeur ;
statut ;
variantes ;
ordre de priorité.
Exemples de catégories :
attraction ;
répulsion ;
projection ;
identification ;
émotion ;
contradiction ;
évolution ;
décision.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
8

---

14. RÉPONSES
Une réponse doit être associée à :
l'utilisateur ;
la séance ;
la question ;
éventuellement la photographie ;
la date ;
le contenu original.
Le système peut également conserver :
émotion choisie ;
mots-clés ;
associations ;
réponse libre.
Le texte original est immuable.
15. CARNET
Le carnet constitue la mémoire longitudinale du joueur .
Une entrée peut contenir :
DATE
QUESTION
PHOTOS PRÉSENTÉES
PHOTOS CHOISIES
PHOTOS REJETÉES
RÉACTIONS
TEXTES
ÉMOTIONS
ASSOCIATIONS
OBSERVATIONS IA
RÉACTIONS À L'IA
Le carnet doit être consultable chronologiquement.
16. IMAGES FANTÔMES
Une image présentée mais non choisie doit pouvoir rester dans l'historique.
Statuts possibles :
•
•
•
•
•
•
•
•
•
•
9

---

vue
ignorée
rejetée
choisie
choisie puis retirée
revisitée
choisie ultérieurement
Cela permet au moteur de proposer ultérieurement :
« Tu avais rencontré cette image auparavant. Aujourd'hui, veux-tu la regarder
autrement ? »
La fréquence de ces propositions doit être configurable.
17. MOTEUR D'ANALYSE
L'analyse doit fonctionner à plusieurs niveaux.
Niveau 1
Analyse d'une séance.
Niveau 2
Analyse des dernières séances.
Niveau 3
Analyse d'une période.
Niveau 4
Analyse du carnet complet.
Niveau 5
Analyse de l'évolution.
Chaque analyse doit être identifiable et datée.
10

---

18. EXTRACTION DES SIGNAUX
Le système peut extraire :
thèmes ;
mots récurrents ;
émotions ;
associations ;
motifs visuels ;
images fréquemment choisies ;
images fréquemment rejetées ;
évolutions ;
contradictions ;
changements.
Ces éléments constituent des signaux d'analyse, pas des diagnostics.
19. ANALYSE DES CHOIX PHOTOGRAPHIQUES
L'analyse peut mettre en relation :
IMAGE
↓
MÉTADONNÉES
↓
CHOIX DU JOUEUR
↓
RÉPONSE DU JOUEUR
↓
HISTORIQUE
Exemple :
Le système constate que certaines caractéristiques visuelles apparaissent régulièrement parmi les
images choisies.
Il peut alors créer une hypothèse de récurrence.
20. ANALYSE DES CONTRADICTIONS
Le moteur doit pouvoir comparer :
ce que le joueur écrit
avec
•
•
•
•
•
•
•
•
•
•
11

---

ce qu'il choisit.
Exemple :
Écrit :
« J'ai besoin de changement. »
Choix récurrents :
refuge
immobilité
protection
intérieur
L'IA peut proposer une observation.
Elle ne doit pas en déduire automatiquement une signification psychologique.
21. IA — PRINCIPE D'INTERVENTION
L'IA doit intervenir comme un miroir interprétatif, jamais comme un diagnosticien.
Formulations privilégiées :
« Je remarque… »
« Une récurrence apparaît… »
« Il semble y avoir … »
« Une hypothèse possible serait… »
« Est-ce que cela résonne avec toi ? »
Formulations interdites :
« Tu es… »
« Ton problème est… »
« Tu souffres de… »
« Ton inconscient te dit… »
12

---

22. VALIDATION PAR LE JOUEUR
Chaque observation IA peut recevoir une réaction :
ÇA ME PARLE
JE NE SAIS PAS
CE N'EST PAS ÇA
JE VEUX EXPLORER
Cette réaction est enregistrée dans le carnet.
L'IA peut ainsi distinguer :
ce qu'elle observe ;
ce qu'elle propose ;
ce que le joueur reconnaît ;
ce qu'il rejette.
23. RÉGLAGES JOUEUR
Le joueur dispose d'un espace :
« Mon expérience »
Paramètres possibles :
Intensité
légère ;
équilibrée ;
profonde.
Style
intuitif ;
réflexif ;
mixte.
Intervention IA
minimale ;
occasionnelle ;
régulière.
Retour sur l'historique
rare ;
•
•
•
•
•
•
•
•
•
•
•
•
•
•
13

---

normal ;
fréquent.
Niveau de surprise
prévisible ;
équilibré ;
surprenant.
Ces paramètres influencent le moteur sans nécessiter de modification du code.
24. RÉGLAGES ADMINISTRATEUR
L'administration doit permettre de modifier les paramètres du jeu.
Tirage
nombre d'images ;
nombre de nouvelles images ;
nombre d'images historiques ;
nombre d'images de contraste ;
niveau de hasard ;
diversité minimale ;
fréquence de répétition ;
délai avant réapparition.
Historique
fréquence de retour d'anciennes images ;
délai de retour ;
traitement des images rejetées ;
traitement des images choisies puis abandonnées.
IA
fréquence d'intervention ;
profondeur d'analyse ;
longueur des observations ;
niveau de prudence ;
types d'analyses activés ;
seuil de récurrence ;
période d'analyse ;
fréquence des synthèses.
Séances
modes disponibles ;
ordre des étapes ;
nombre maximal de questions ;
profondeur maximale ;
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
14

---

possibilité de passer une étape.
25. CONFIGURATION DYNAMIQUE
Toutes les valeurs modifiables doivent être stockées dans un système de configuration.
Exemple conceptuel :
CONFIGURATION
│
├── tirage
│   ├── nombre_images
│   ├── hasard
│   ├── nouvelles
│   ├── historique
│   └── contraste
│
├── historique
│   ├── retour_images
│   ├── délai
│   └── images_rejetées
│
├── ia
│   ├── fréquence
│   ├── profondeur
│   ├── seuil_recurrence
│   └── synthèse
│
└── séances
    ├── modes
    ├── profondeur
    └── questions
Aucune valeur importante ne doit être obligatoirement inscrite directement dans le code.
26. PROFILS DE CONFIGURATION
L'administrateur doit pouvoir créer plusieurs profils de configuration.
Exemples :
Configuration standard
Configuration découverte
Configuration profonde
•
15

---

Configuration test 01
Configuration test 02
Un profil peut être activé sans modifier le programme.
Cela permet d'expérimenter différentes versions du jeu.
27. MODE LABORATOIRE
L'administration doit disposer d'un mode expérimental.
Il doit permettre :
modifier les paramètres ;
créer une configuration ;
tester une configuration ;
comparer plusieurs configurations ;
activer/désactiver une configuration ;
revenir à une configuration précédente.
Exemple :
CONFIGURATION TEST 03
Photos par tirage       6
Hasard                  65 %
Images nouvelles        3
Images historiques      2
Contraste               1
Retour image            21 jours
Analyse IA              après 4 séances
Seuil récurrence        3
Actions :
TESTER
ENREGISTRER
ACTIVER
DUPLIQUER
ARCHIVER
RESTAURER
•
•
•
•
•
•
16

---

28. VERSIONNEMENT
Chaque configuration doit être versionnée.
Exemple :
Configuration standard
Version 1.0
Version 1.1
Version 1.2
Une séance doit pouvoir être associée à la version de configuration utilisée.
Cela permet de savoir précisément :
avec quelles règles cette expérience a été réalisée.
Même principe pour :
prompts IA ;
règles d'analyse ;
taxonomie ;
bibliothèque.
29. EXPÉRIMENTATION
L'architecture doit permettre de tester différentes hypothèses.
Exemples :
Expérience A
5 images par tirage.
Expérience B
7 images.
Expérience C
9 images.
Ou :
•
•
•
•
17

---

IA après 3 séances
contre
IA après 7 séances.
L'objectif est de pouvoir faire évoluer le produit par expérimentation, sans développement
systématique.
30. ADMINISTRATION DE LA PHOTOTHÈQUE
L'administrateur doit pouvoir :
ajouter une image ;
remplacer une image ;
archiver une image ;
supprimer une image ;
renseigner ses métadonnées ;
ajouter des tags ;
gérer ses droits ;
activer/désactiver une image ;
modifier son niveau de disponibilité.
Il doit également pouvoir visualiser les statistiques d'utilisation d'une image.
31. STATISTIQUES DE PHOTOGRAPHIE
Pour chaque photo, l'administration peut consulter :
nombre d'apparitions ;
nombre de sélections ;
nombre de rejets ;
taux de sélection ;
nombre de retours ;
nombre de séances concernées.
Ces statistiques permettent notamment d'identifier les images trop attractives, trop neutres ou
insuffisamment utilisées.
32. ADMINISTRATION DES QUESTIONS
L'administrateur doit pouvoir :
créer ;
modifier ;
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
18

---

désactiver ;
catégoriser ;
ordonner ;
associer une question à un mode de séance ;
créer plusieurs variantes.
Les questions doivent être éditables sans modification du code.
33. GESTION DU CONTENU IA
Les éléments éditoriaux contrôlant l'IA doivent être séparés du programme.
L'administration doit pouvoir gérer :
instructions générales ;
ton ;
longueur ;
niveau de prudence ;
types d'observations ;
règles de formulation ;
seuils ;
catégories d'analyse.
Les versions précédentes doivent rester archivées.
34. EXTENSION À D'AUTRES MÉDIAS
Le système doit être conçu autour de la notion générique de :
STIMULUS
La photographie constitue le premier stimulus.
L'architecture doit permettre ultérieurement d'ajouter :
mots ;
textes ;
formes ;
sons ;
musiques ;
vidéos.
Le moteur de séance ne doit donc pas être structurellement dépendant d'une photographie.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
19

---

35. DONNÉES BRUTES / ANALYSE / VALIDATION
Le système doit maintenir trois niveaux distincts.
Niveau 1 — réalité
Ce que le joueur a réellement fait.
Niveau 2 — interprétation
Ce que l'IA propose comme observation.
Niveau 3 — reconnaissance
Ce que le joueur considère comme pertinent.
DONNÉE
   ↓
OBSERVATION IA
   ↓
RÉACTION DU JOUEUR
Cette séparation est fondamentale.
36. CONFIDENTIALITÉ
Les données du carnet sont privées par défaut.
Le système doit permettre :
suppression d'une séance ;
suppression d'une entrée ;
suppression du carnet ;
suppression du compte ;
export des données ;
suppression des analyses IA ;
gestion des préférences de conservation.
Le joueur doit être clairement informé de l'utilisation de ses données dans les analyses IA.
37. SÉCURITÉ ÉDITORIALE DE L'IA
Le système doit intégrer des règles empêchant l'IA de :
diagnostiquer ;
•
•
•
•
•
•
•
•
20

---

médicaliser une réponse ;
affirmer une pathologie ;
prétendre révéler l'inconscient ;
transformer une hypothèse en certitude ;
imposer une interprétation.
L'IA doit toujours conserver une formulation hypothétique.
38. ÉVOLUTION DU CARNET
Le carnet doit pouvoir produire plusieurs représentations :
Chronologique
Toutes les séances dans l'ordre.
Thématique
Regroupement des séances par thèmes.
Photographique
Évolution des images choisies.
Temporelle
Évolution d'un thème ou d'une émotion.
Miroir
Observations IA et réactions du joueur .
Synthèse
Vue globale du parcours.
39. SYNTHÈSE LONGITUDINALE
À intervalles configurables, l'IA peut générer :
« Ton paysage actuel »
Cette synthèse peut contenir :
thèmes récurrents ;
évolutions ;
•
•
•
•
•
•
•
21

---

nouvelles apparitions ;
disparitions ;
contradictions ;
questions ouvertes ;
changements dans les choix photographiques.
Chaque synthèse est :
datée ;
conservée ;
versionnée.
Une nouvelle synthèse ne remplace jamais l'ancienne.
40. ÉVOLUTION DU JOUEUR
Le système doit permettre une comparaison :
Aujourd'hui
↓
30 derniers jours
↓
3 derniers mois
↓
Depuis le début
L'objectif est de rendre visible le déplacement du joueur plutôt que de produire un « profil ».
41. PRINCIPES DE CONCEPTION DU MOTEUR
Le moteur doit privilégier :
diversité ;
surprise ;
ambiguïté ;
continuité ;
personnalisation ;
imprévisibilité contrôlée.
Il doit éviter :
répétition mécanique ;
interprétation déterministe ;
questionnaire rigide ;
expérience identique pour tous.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
22

---

42. ÉVOLUTIVITÉ
Le système doit pouvoir accueillir ultérieurement :
nouvelles familles de séances ;
nouvelles catégories d'images ;
nouvelles règles de tirage ;
nouveaux modèles d'analyse ;
nouveaux médias ;
nouveaux modes d'interaction ;
nouvelles formes de carnet.
L'ajout d'une nouvelle fonctionnalité ne doit pas nécessiter une refonte du cœur du système.
43. PRIORITÉ DE DÉVELOPPEMENT
Le développement devra prioriser :
PRIORITÉ 1
comptes ;
photothèque ;
tirage ;
sélection ;
séance ;
carnet.
PRIORITÉ 2
métadonnées photographiques ;
historique détaillé ;
images fantômes ;
modes de séance supplémentaires.
PRIORITÉ 3
analyse IA ;
récurrences ;
contradictions ;
miroir .
PRIORITÉ 4
configuration avancée ;
laboratoire ;
versionnement ;
expérimentation.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
23

---

PRIORITÉ 5
nouveaux médias ;
fonctionnalités avancées d'évolution personnelle.
44. RÈGLE D'OR DU PROJET
Le système doit toujours distinguer :
ce que l'utilisateur a choisi
de
ce que le système en déduit
et de
ce que l'utilisateur reconnaît comme juste.
C'est cette distinction qui constitue le socle conceptuel et technique de RÉSONANCE.
45. SYNTHÈSE DE L'ARCHITECTURE
                         RÉSONANCE
                             │
              ┌──────────────┴──────────────┐
              │                             │
         CONFIGURATION                 CONTENU
              │                             │
      ┌───────┼────────┐             ┌──────┴──────┐
      │       │        │             │             │
    Tirage    IA     Séances      Photos       Questions
      │       │        │             │             │
      └───────┴────────┴─────────────┴─────────────┘
                              │
                              ▼
                         MOTEUR DE JEU
                              │
                              ▼
                           SÉANCE
                              │
                              ▼
                         INTERACTIONS
                              │
                              ▼
                            CARNET
•
•
24

---

│
                    ┌─────────┴─────────┐
                    │                   │
               DONNÉES BRUTES      HISTORIQUE
                    │                   │
                    └─────────┬─────────┘
                              ▼
                         ANALYSE IA
                              │
                              ▼
                         OBSERVATION
                              │
                              ▼
                    RÉACTION DU JOUEUR
                              │
                              ▼
                           CARNET
                              │
                              └──────► nouvelle boucle
46. CONCLUSION
RÉSONANCE ne doit pas être développé comme une application dont le comportement serait fixé une
fois pour toutes.
Il doit être conçu comme un moteur d'expérience configurable et expérimental.
La première version du jeu ne sera probablement pas la meilleure.
Il faudra pouvoir tester :
combien d'images proposer ;
quelle part donner au hasard ;
quand faire revenir une image ;
quand faire intervenir l'IA ;
quelle profondeur de questionnement fonctionne ;
quelles images provoquent réellement une résonance ;
quelles observations IA sont pertinentes ;
quelles mécaniques donnent envie de revenir .
Le code doit fournir le moteur.
La configuration doit fournir les règles.
Le contenu doit fournir la matière.
L'IA doit fournir le miroir.
Le joueur doit rester maître du sens.
•
•
•
•
•
•
•
•
25
