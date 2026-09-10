# Contenu et moteur éditorial

> Version lisible sur GitHub du fichier source : `contenu et moteur éditoriale.odt` (conservé à la racine du dépôt).

---

# SPÉCIFICATIONS DU CONTENU ET DU MOTEUR ÉDITORIAL

Version 1.0 — Document de conceptionStatut : Document de référence

## 1. Objet du document

Le présent document définit la conception éditoriale de RÉSONANCE et les règles selon lesquelles les contenus sont sélectionnés, associés, présentés et renouvelés au cours d'une partie.

Il précise notamment :

- la nature des textes ;
- la nature des images et formes ;
- les questions proposées au joueur ;
- les métadonnées associées aux contenus ;
- les règles de constitution des tirages ;
- les règles d'association entre textes et images ;
- les mécanismes de récurrence ;
- les mécanismes de contraste et de contradiction ;
- la progression éditoriale ;
- le rôle de l'IA dans l'exploitation des contenus ;
- les règles permettant de préserver la liberté d'interprétation du joueur.

Ce document ne décrit pas l'implémentation technique du moteur.

Il décrit la logique éditoriale que le moteur devra respecter.

## 2. Philosophie éditoriale

RÉSONANCE n'est pas une base de questions psychologiques.

Ce n'est pas non plus un test dont chaque image correspond à une signification cachée.

Le contenu doit créer des situations suffisamment ouvertes pour permettre au joueur de produire son propre sens.

Le contenu constitue donc un matériau de projection.

Le principe directeur est :

Ne pas dire au joueur ce qu'il est. Créer les conditions pour qu'il puisse entendre ce qui résonne en lui.

## 3. Les quatre familles de contenus

Le moteur éditorial repose sur quatre familles principales :

#### A. Les textes

Ils provoquent, déplacent, questionnent ou ouvrent une situation.

#### B. Les images

Elles constituent les supports projectifs.

#### C. Les invitations

Elles permettent au joueur de mettre des mots sur sa résonance.

#### D. Les éléments de mise en perspective

Ils permettent de revenir sur le parcours et de faire émerger des rapprochements.

Ces quatre familles doivent rester distinctes dans la conception.

## 4. Les textes

### 4.1 Fonction

Un texte n'a pas pour fonction de transmettre une information.

Il sert à créer un espace intérieur dans lequel le joueur va entrer avant de rencontrer les images.

Il peut :

- provoquer une émotion ;
- évoquer une situation ;
- créer une tension ;
- introduire une contradiction ;
- faire émerger une question ;
- évoquer un choix ;
- ouvrir une possibilité.

## 5. Typologie des textes

Le catalogue éditorial doit comporter plusieurs familles.

#### 5.1 Textes d'évocation

Ils évoquent une situation sans poser directement de question.

Exemple :

« Il y a des endroits où l'on reste longtemps après avoir cessé d'y être. »

#### 5.2 Textes de tension

Ils introduisent deux directions possibles.

Exemple :

« Une partie de toi veut avancer. Une autre préfère encore attendre. »

#### 5.3 Textes de choix

Ils mettent le joueur face à une possibilité.

Exemple :

« Tu pourrais rester exactement où tu es. Tu pourrais aussi faire un pas. »

#### 5.4 Textes de déplacement

Ils invitent à regarder une situation autrement.

Exemple :

« Et si ce que tu considères comme un obstacle était aussi une protection ? »

#### 5.5 Textes de projection

Ils ouvrent une possibilité future.

Exemple :

« Imagine que personne ne t'attende de nulle part. Que choisirais-tu de faire ? »

#### 5.6 Textes de retour

Ils permettent de revisiter un élément rencontré précédemment.

Exemple :

« Au début de ton parcours, tu avais choisi cette image. Regarde-la maintenant. »

## 6. Règles de rédaction des textes

Les textes doivent être :

- courts ;
- évocateurs ;
- compréhensibles ;
- ouverts ;
- non moralisateurs ;
- non prescriptifs.

Ils doivent éviter :

- les diagnostics ;
- les affirmations psychologiques ;
- les clichés thérapeutiques ;
- les réponses induites ;
- les formulations culpabilisantes.

#### Règle essentielle

Un texte peut ouvrir une porte.

Il ne doit pas dire au joueur ce qu'il trouvera derrière.

## 7. Les images

Les images constituent le cœur projectif de RÉSONANCE.

Elles ne sont pas des illustrations des textes.

C'est un point fondamental.

Une image n'a pas besoin de « représenter » le texte.

Elle doit pouvoir résonner avec lui.

## 8. Nature des images

Le catalogue peut comporter :

- photographies ;
- illustrations ;
- formes abstraites ;
- paysages ;
- objets ;
- silhouettes ;
- architectures ;
- scènes ;
- détails ;
- textures ;
- compositions graphiques.

Le moteur doit pouvoir mélanger ces catégories.

## 9. Pourquoi utiliser des images très différentes

La diversité visuelle empêche le joueur de rechercher une logique unique.

Une série peut ainsi présenter simultanément :

- une photographie ;
- une forme abstraite ;
- un objet ;
- un paysage ;
- une silhouette ;
- une scène.

Le joueur ne doit pas savoir pourquoi ces six éléments lui sont proposés ensemble.

Cette légère étrangeté participe au principe de RÉSONANCE.

## 10. Les images ne possèdent pas de signification fixe

Une image peut être associée à plusieurs thèmes éditoriaux.

Par exemple, une porte peut évoquer :

- une possibilité ;
- une séparation ;
- une protection ;
- une curiosité ;
- une peur ;
- un souvenir ;
- une contrainte.

Le système ne doit donc jamais stocker :

Porte = changement.

Il doit plutôt stocker :

Porte → possibilités de résonance : ouverture, séparation, seuil, attente, passage, protection…

Cette différence est fondamentale.

## 11. Métadonnées des images

Chaque image peut être accompagnée de métadonnées éditoriales.

Par exemple :

Ces métadonnées servent au moteur, pas au joueur.

## 12. Ne jamais enfermer une image dans une catégorie

Une image peut appartenir à plusieurs familles.

Elle peut être :

- à la fois ouverture et enfermement ;
- à la fois solitude et liberté ;
- à la fois mouvement et immobilité.

Le moteur doit conserver cette ambiguïté.

L'ambiguïté est une richesse éditoriale.

## 13. Les tirages

Un tirage correspond à l'ensemble des images présentées au joueur pour une séquence.

#### Configuration initiale recommandée

6 images par tirage.

Le nombre doit rester configurable.

## 14. Constitution d'un tirage

Le moteur doit chercher un équilibre entre :

- diversité ;
- cohérence ;
- surprise ;
- ambiguïté ;
- absence de réponse évidente.

Un tirage ne doit pas être constitué de six images représentant exactement le même thème.

Mais il ne doit pas non plus être totalement incohérent.

## 15. Le principe de « distance »

Le moteur éditorial doit pouvoir mesurer la proximité entre les images d'un tirage.

Exemple :

Six images représentant :

- une porte ;
- une fenêtre ;
- un escalier ;
- un chemin ;
- un pont ;
- une route

seraient trop proches.

À l'inverse :

- une porte ;
- un visage ;
- une forêt ;
- une chaise ;
- une forme abstraite ;
- un bateau

créent davantage d'espace projectif.

## 16. L'association texte / images

Il ne doit pas exister une correspondance déterministe :

Texte A → Image B.

Le moteur travaille plutôt avec des degrés de compatibilité.

Un texte peut avoir :

- des images fortement compatibles ;
- des images moyennement compatibles ;
- des images neutres ;
- exceptionnellement des images en contraste.

## 17. Le paradoxe éditorial

Une image qui semble peu correspondre au texte peut parfois être particulièrement intéressante.

Le moteur doit donc conserver une proportion limitée d'images de décalage.

Cela crée une question implicite :

« Pourquoi est-ce justement celle-là qui m'attire ? »

## 18. Le tirage doit éviter la réponse évidente

Si le texte parle de solitude et que cinq images représentent des personnes seules, le choix devient trop explicite.

Le joueur risque alors de répondre au contenu plutôt qu'à sa propre résonance.

Le moteur doit privilégier :

l'évocation plutôt que l'illustration.

## 19. Les questions

Les questions constituent un outil d'approfondissement.

Elles ne doivent pas être systématiques.

Le silence ou le passage direct à la séquence suivante doivent rester possibles.

## 20. Types de questions

#### Question d'attraction

« Qu'est-ce qui t'a attiré ici ? »

#### Question de détail

« Quel détail regardes-tu en premier ? »

#### Question émotionnelle

« Qu'est-ce que cette image provoque en toi ? »

#### Question projective

« Si cette image pouvait te parler, que dirait-elle ? »

#### Question personnelle

« À quoi cela te fait-il penser ? »

#### Question de déplacement

« Qu'est-ce que tu ne regardais pas au premier abord ? »

#### Question de temporalité

« Est-ce que cette image appartient plutôt à ton passé, ton présent ou ton futur ? »

## 21. Les questions ne doivent pas suggérer la réponse

À éviter :

« Est-ce que cette image représente ta peur du changement ? »

À privilégier :

« Qu'est-ce que cette image représente pour toi ? »

Le joueur doit produire la signification.

## 22. Le silence comme contenu

Une séquence peut ne poser aucune question.

Après le choix, le système peut simplement afficher :

« Garde-la un instant. »

Puis poursuivre.

Cette mécanique permet d'éviter que RÉSONANCE devienne une succession de questionnaires.

## 23. Les familles de résonance

Les contenus peuvent être associés à des champs de résonance larges.

Exemples :

- mouvement ;
- immobilité ;
- séparation ;
- lien ;
- solitude ;
- liberté ;
- peur ;
- désir ;
- choix ;
- attente ;
- transformation ;
- identité ;
- regard ;
- limite ;
- passage ;
- perte ;
- recommencement.

Ces catégories ne constituent pas des profils psychologiques.

Elles servent à organiser le contenu.

## 24. Le moteur éditorial

Le moteur éditorial a pour mission de sélectionner les contenus.

Il doit respecter simultanément :

- les contraintes de la séquence ;
- la diversité ;
- l'historique du joueur ;
- les règles de récurrence ;
- les règles de contraste ;
- les paramètres de la partie.

## 25. Ce que le moteur connaît

Le moteur peut connaître :

- les contenus déjà vus ;
- les images choisies ;
- les thèmes associés ;
- les réponses données ;
- les récurrences ;
- les séquences précédentes ;
- la progression de la partie.

## 26. Ce que le moteur ne doit pas déduire

Le moteur ne doit pas transformer mécaniquement ces données en conclusions psychologiques.

Exemple :

Donnée :

Image « porte » choisie trois fois.

Autorisé :

« Cette image revient plusieurs fois dans ton parcours. »

Non autorisé :

« Tu as peur de t'engager. »

## 27. Gestion des récurrences

Une récurrence peut être :

#### Visuelle

Même image ou forme similaire.

#### Thématique

Même champ de résonance.

#### Narrative

Des textes évoquant une même situation.

#### Verbale

Des mots ou expressions qui reviennent dans les réponses du joueur.

#### Comportementale

Une tendance observable dans les choix.

Le moteur doit différencier ces niveaux.

## 28. Règle de fréquence

Une récurrence ne doit pas être signalée trop tôt.

Si un élément apparaît deux fois de suite, il peut simplement s'agir du hasard.

Le moteur doit disposer d'un seuil configurable avant de proposer une mise en perspective.

## 29. Le contraste

Le moteur peut également détecter des changements.

Exemple :

Première partie :

choix associé à l'ouverture.

Plus tard :

choix associé à la fermeture.

Le système peut proposer :

« Ton parcours prend aujourd'hui une autre direction. »

Il ne doit pas conclure pourquoi.

## 30. L'évolution

Le moteur peut chercher des transformations dans le parcours :

répétition → variation → rupture → nouvelle récurrence.

L'évolution devient alors plus intéressante que la simple répétition.

## 31. Progression éditoriale

Les contenus doivent pouvoir être organisés en plusieurs niveaux.

#### Phase 1 — Entrer

Créer la curiosité.

#### Phase 2 — Résonner

Permettre les premiers choix intuitifs.

#### Phase 3 — Approfondir

Introduire des questions plus personnelles.

#### Phase 4 — Déplacer

Introduire contradictions et angles morts.

#### Phase 5 — Relier

Faire apparaître les récurrences.

#### Phase 6 — Formuler

Permettre au joueur de donner une forme à ce qui a émergé.

## 32. L'intensité

Tous les contenus ne doivent pas avoir la même intensité.

Chaque contenu peut recevoir un niveau :

1 — léger

2 — évocateur

3 — profond

4 — confrontant

5 — très confrontant

Le moteur peut utiliser cette information pour éviter de commencer immédiatement avec les contenus les plus intenses.

## 33. Règle de montée progressive

Une partie doit éviter un passage brutal :

jeu léger → question existentielle extrêmement forte.

L'intensité doit pouvoir augmenter progressivement.

Cependant, le joueur doit rester libre de rencontrer des contenus surprenants.

## 34. Le contenu sensible

Certains contenus peuvent évoquer :

- la perte ;
- la mort ;
- la séparation ;
- l'abandon ;
- la solitude ;
- la peur ;
- le regret ;
- le vieillissement ;
- l'identité.

Ils doivent être identifiés comme contenus potentiellement sensibles.

Le moteur doit pouvoir contrôler leur fréquence.

## 35. L'angle mort éditorial

L'angle mort ne constitue pas une catégorie d'interprétation.

Il constitue une forme de questionnement.

Le moteur peut proposer :

« Et si tu regardais cette situation depuis l'autre côté ? »

ou :

« Qu'est-ce que tu ne prends pas en compte ici ? »

Il doit rester ouvert.

## 36. Génération des formulations

Les formulations peuvent être :

- écrites à l'avance ;
- choisies parmi plusieurs variantes ;
- générées ou reformulées par l'IA.

Cependant, le sens éditorial doit être contrôlé.

L'IA ne doit pas être autorisée à inventer librement des interprétations psychologiques.

## 37. Rôle de l'IA dans le moteur éditorial

L'IA peut intervenir à trois niveaux.

#### Niveau 1 — Reformulation

Elle reformule une réponse du joueur.

#### Niveau 2 — Mise en relation

Elle rapproche des éléments explicitement présents.

#### Niveau 3 — Questionnement

Elle propose une nouvelle question à partir du parcours.

Elle ne doit pas devenir un quatrième niveau :

« interprétation de la personne ».

## 38. Hiérarchie des sources

Pour toute mise en perspective, le moteur doit privilégier :

- les paroles du joueur ;
- les choix observables ;
- les répétitions objectives ;
- les relations entre éléments ;
- les hypothèses ouvertes.

Plus on descend dans cette liste, plus le langage doit devenir prudent.

## 39. Exemple complet

#### Texte

« Parfois, avancer signifie simplement cesser d'attendre. »

#### Tirage

Six images très différentes sont présentées.

Le joueur choisit une image représentant une fenêtre.

#### Question

« Qu'est-ce qui t'a attiré dans cette image ? »

Le joueur répond :

« Le fait qu'on puisse regarder dehors sans sortir. »

#### Plus tard

Une autre séquence fait apparaître une fenêtre différente.

Le joueur la choisit également.

Le moteur constate la répétition.

#### Mise en perspective

« Les fenêtres semblent avoir une place particulière dans ton parcours. Qu'est-ce que tu regardes à travers elles ? »

Le moteur ne dit pas :

« Tu as peur de sortir de ta zone de confort. »

La différence entre les deux approches constitue une règle fondamentale du produit.

## 40. Catalogue éditorial

Le système devra pouvoir gérer un catalogue structuré comprenant au minimum :

#### Textes

- identifiant ;
- texte ;
- catégorie ;
- intensité ;
- thèmes ;
- phase de progression ;
- contraintes éventuelles ;
- statut.

#### Images

- identifiant ;
- fichier ;
- famille ;
- métadonnées ;
- thèmes ;
- intensité ;
- statut ;
- fréquence maximale éventuelle.

#### Questions

- identifiant ;
- formulation ;
- type ;
- intensité ;
- contexte d'utilisation ;
- phase ;
- statut.

## 41. Versionnement des contenus

Les contenus doivent être versionnés.

Une modification éditoriale ne doit pas modifier rétroactivement les parties déjà jouées.

Le carnet doit conserver le contenu réellement rencontré par le joueur.

## 42. Équilibre du catalogue

Le catalogue doit être suffisamment important pour éviter la répétition mécanique.

La diversité doit exister sur plusieurs dimensions :

- visuelle ;
- thématique ;
- émotionnelle ;
- narrative ;
- stylistique.

## 43. Règle contre l'épuisement

Le moteur doit éviter de présenter trop fréquemment :

- la même image ;
- le même thème ;
- la même question ;
- la même formulation ;
- la même structure de séquence.

La répétition volontaire doit être distinguée de la répétition accidentelle.

## 44. La répétition volontaire

Une répétition peut être utilisée intentionnellement lorsqu'elle possède une fonction éditoriale.

Par exemple :

une image déjà rencontrée réapparaît après plusieurs séquences.

Elle devient alors un événement du jeu.

Le système doit pouvoir distinguer :

répétition aléatoire

de

répétition éditorialement provoquée.

## 45. Le moteur doit conserver de l'imprévisibilité

Même lorsque le moteur dispose de nombreuses informations sur le joueur, il ne doit pas devenir totalement prévisible.

Une part de hasard doit demeurer.

L'objectif est que le joueur puisse parfois penser :

« Pourquoi est-ce que c'est celle-là qui arrive maintenant ? »

sans que le système prétende lui donner la réponse.

## 46. Principe d'équilibre du moteur

Le moteur éditorial doit maintenir un équilibre entre :

HASARD

et

COHÉRENCE

Trop de hasard :

expérience incohérente.

Trop de cohérence :

expérience prévisible et analytique.

RÉSONANCE doit vivre entre les deux.

## 47. Règle fondamentale du moteur

Le moteur ne cherche pas à déterminer ce que le joueur devrait rencontrer.

Il cherche à construire une rencontre suffisamment intéressante pour que le joueur puisse y produire son propre sens.

## 48. Architecture éditoriale cible

Le catalogue peut finalement être représenté ainsi :

CONTENUS

→ Textes→ Images→ Questions→ Interventions→ Angles morts→ Formulations de clôture

↓

MÉTADONNÉES

→ thèmes→ intensité→ phase→ relations→ fréquence→ contraintes

↓

MOTEUR ÉDITORIAL

→ sélection→ filtrage→ équilibrage→ hasard→ récurrence→ contraste

↓

EXPÉRIENCE JOUEUR

→ lecture→ choix→ expression→ résonance→ mise en perspective→ mémoire

## 49. Critères de validation d'un contenu

Avant d'être intégré au catalogue, chaque contenu doit pouvoir répondre positivement aux questions suivantes :

#### Le contenu est-il ouvert ?

Le joueur peut-il lui donner plusieurs significations ?

#### Est-il évocateur ?

Provoque-t-il quelque chose sans expliquer quoi ?

#### Est-il non prescriptif ?

Ne dit-il pas au joueur ce qu'il doit penser ?

#### Est-il cohérent avec RÉSONANCE ?

Contribue-t-il réellement à l'expérience ?

#### Peut-il être utilisé sans contexte ?

Une image ou une question ne doit pas dépendre d'une interprétation cachée connue uniquement du concepteur.

## 50. Critère ultime

Un bon contenu RÉSONANCE ne produit pas nécessairement :

« Ah oui, je comprends ce que ça veut dire. »

Il peut produire :

« Je ne sais pas pourquoi, mais c'est celle-là. »

Et cette réaction constitue précisément le point de départ de l'expérience.

## 51. Synthèse

Le moteur éditorial de RÉSONANCE doit donc être conçu comme un système qui combine :

HASARD

pour empêcher la stratégie,

DIVERSITÉ

pour maintenir l'ouverture,

COHÉRENCE

pour donner du sens au parcours,

MÉMOIRE

pour permettre les résonances différées,

CONTRASTE

pour faire apparaître les déplacements,

QUESTIONNEMENT

pour approfondir,

et

SOUVERAINETÉ DU JOUEUR

pour empêcher l'application de devenir interprète de sa personne.

## 52. Principe directeur final

RÉSONANCE ne possède pas les réponses cachées du joueur.

Il possède seulement des chemins pour l'aider à les rencontrer.

Le moteur éditorial doit donc être intelligent dans la composition de l'expérience, mais volontairement humble dans son interprétation de la personne.
