
# ÉTAT DE RÉFÉRENCE — RÉSONANCE

**Dernière mise à jour : 11 septembre 2026**

Ce fichier constitue la mémoire fonctionnelle et stratégique de référence du projet RÉSONANCE.

Il doit permettre de reprendre le projet sans repartir de zéro, même après plusieurs jours ou dans une nouvelle conversation.

---

# 1. IDENTITÉ DU PROJET

RÉSONANCE est un **jeu introspectif et projectif**, conçu comme une expérience ludique.

Ce n'est :

* ni un questionnaire ;
* ni un test psychologique ;
* ni un outil thérapeutique ;
* ni un système de diagnostic ;
* ni un système qui prétend révéler une vérité sur le joueur.

### Principe fondateur

> **Le joueur donne du sens à ce qu'il choisit.
> RÉSONANCE crée les conditions de cette résonance.
> L'application ne donne pas de sens à sa place.**

Le joueur reste souverain de son interprétation.

RÉSONANCE peut observer des choix, des répétitions, des évolutions ou des associations, mais ne doit jamais transformer ces observations en vérité psychologique imposée.

---

# 2. POSITIONNEMENT DE RÉSONANCE

RÉSONANCE doit être :

* curieux ;
* mystérieux ;
* élégant ;
* intime ;
* surprenant ;
* adulte ;
* suffisamment ludique pour donner envie de revenir.

Il ne doit pas devenir :

* médicalisant ;
* pseudo-psychologique ;
* moralisateur ;
* prescriptif ;
* démonstratif ;
* "coach" ;
* machine à produire des profils.

### Phrase de référence

> **Tu choisis une image. Puis tu découvres pourquoi tu l'as choisie.**

Cette phrase décrit une promesse d'expérience, pas une promesse de diagnostic.

---

# 3. NON-NÉGOCIABLES

## 3.1 Le joueur reste souverain

Aucune interprétation psychologique ne doit être présentée comme une vérité.

Interdit :

> "Tu as peur de l'abandon."

Possible :

> "La séparation apparaît plusieurs fois dans tes choix."

Ou :

> "Tu sembles revenir à cette image. Qu'est-ce qu'elle évoque pour toi aujourd'hui ?"

---

## 3.2 Les images ne possèdent pas de signification fixe

Une image peut évoquer plusieurs choses selon la personne et selon le contexte.

Exemple :

Une porte peut évoquer :

* possibilité ;
* séparation ;
* protection ;
* curiosité ;
* peur ;
* souvenir ;
* contrainte ;
* passage.

Le moteur doit donc stocker des **résonances possibles**, jamais une équivalence du type :

> porte = changement.

---

## 3.3 Pas de score

RÉSONANCE ne donne pas de score au joueur.

Pas de :

* personnalité X ;
* profil Y ;
* niveau psychologique ;
* classement ;
* "vous êtes à 78 %...".

La progression éventuelle est une progression d'expérience, pas une progression psychologique.

---

## 3.4 Le chemin n'est pas imposé

Les notions de :

* parcours ;
* espaces ;
* situations ;
* choix ;
* fragments ;

sont des éléments de l'architecture interne du jeu.

Ils ne doivent pas imposer au joueur un parcours psychologique prédéfini.

**Le parcours doit émerger progressivement des choix du joueur.**

RÉSONANCE ne doit pas reproduire le principe d'un parcours linéaire imposé.

---

## 3.5 Le silence est une réponse

Le joueur doit pouvoir :

* ne pas répondre ;
* passer ;
* regarder ;
* revenir ;
* modifier un choix ;
* conserver une image sans savoir pourquoi.

L'absence de réponse constitue une possibilité normale du jeu.

---

# 4. ÉTAT TECHNIQUE ACTUEL

Stack :

* React ;
* Vite ;
* TypeScript ;
* Node.js ;
* Express ;
* SQLite (`node:sqlite`) ;
* migration PostgreSQL possible ultérieurement.

L'IA n'est pas nécessaire au fonctionnement du socle.

### Architecture générale

Le projet est organisé autour de :

* `app/client`
* `app/server`
* `app/server/data`
* `app/server/src`
* `app/server/tests`
* `app/server/uploads`
* `app/ETAT_REFERENCE.md`

Le dépôt GitHub officiel est :

`ariltone/resonnance`

---

# 5. ÉTAT DES BLOCS

## Bloc 1

Validé en jeu.

## Bloc 2

Validé en jeu.

## Bloc 3

Validé et figé.

## Bloc 4

Validé bout-en-bout.

## Bloc 5

Implémenté.

Le parcours permet notamment :

* création d'une partie ;
* situation courante ;
* choix ;
* interruption ;
* reprise ;
* mémoire ;
* rattachement éventuel à un compte.

Le compte n'est jamais obligatoire pour jouer.

## Bloc 6

Le Bloc 6 a été conçu autour de la matière permettant à RÉSONANCE de devenir progressivement un système capable d'observer l'expérience du joueur sans l'interpréter à sa place.

Éléments travaillés :

* modèle éditorial ;
* mémoire / historique ;
* tirage et sélection ;
* signaux ;
* événements et récurrences ;
* progression ;
* carnet ;
* garde-fous concernant l'IA.

### Décisions associées au Bloc 6

* les récurrences sont des observations ;
* elles sont propres au joueur ;
* elles ne constituent pas des diagnostics ;
* les seuils restent configurables et ne sont pas des vérités de design ;
* l'intensité retenue pour le jeu est de **3 niveaux**, pas 5 ;
* les phases sont des phases d'expérience, pas des niveaux psychologiques.

### Six phases d'expérience

1. Entrer
2. Résonner
3. Approfondir
4. Déplacer
5. Relier
6. Formuler

Ces phases décrivent l'évolution possible de l'expérience, pas l'état psychologique du joueur.

---

# 6. INTENSITÉ

RÉSONANCE utilise trois niveaux d'intensité.

Proposition de lecture :

1. **Léger**
2. **Profond**
3. **Confrontant**

L'intensité concerne la nature de l'expérience proposée, pas une mesure de l'état du joueur.

---

# 7. RÉCURRENCES ET MÉMOIRE

La mémoire est importante parce qu'elle permet à RÉSONANCE de devenir autre chose qu'une succession de tirages indépendants.

Mais la mémoire doit rester descriptive.

Le système peut constater :

> "Cette thématique apparaît régulièrement."

Il ne doit pas conclure :

> "Tu as peur de..."

### Types de récurrence possibles

* visuelle ;
* thématique ;
* narrative ;
* verbale ;
* comportementale.

Les récurrences doivent être suffisamment espacées pour éviter de transformer une répétition accidentelle en signal artificiel.

Une répétition peut être :

* accidentelle ;
* significative pour le joueur ;
* ou simplement intéressante.

Le système ne décide pas à sa place.

---

# 8. MOTEUR ÉDITORIAL

Le moteur repose notamment sur quatre familles :

* textes ;
* images ;
* invitations ;
* éléments de perspective.

Les images sont des supports projectifs et non des illustrations littérales des textes.

Le moteur doit rechercher un équilibre entre :

* diversité ;
* cohérence ;
* surprise ;
* ambiguïté ;
* absence de réponse évidente.

La relation texte / image peut être :

* forte ;
* moyenne ;
* neutre ;
* occasionnellement contrastée.

Une image peut appartenir à plusieurs familles ou résonances.

---

# 9. VOCABULAIRE DE RÉSONANCE

Le vocabulaire de référence comprend notamment :

* mouvement ;
* immobilité ;
* séparation ;
* lien ;
* solitude ;
* liberté ;
* peur ;
* désir ;
* choix ;
* attente ;
* transformation ;
* identité ;
* regard ;
* limite ;
* passage ;
* perte ;
* recommencement.

Ce vocabulaire sert au moteur éditorial et à l'observation interne.

Il ne doit pas être transformé en étiquettes psychologiques affichées au joueur.

---

# 10. PHOTOTHÈQUE

La photographie constitue un élément central de RÉSONANCE.

Le premier corpus cible est de **50 photographies en noir et blanc**, suffisamment diverses pour éviter l'impression de mécanique répétitive.

Répartition cible :

* 8 silhouettes / corps ;
* 7 seuils / architectures ;
* 8 paysages / chemins / horizons ;
* 7 objets / détails ;
* 7 ombres / reflets / lumières ;
* 7 scènes humaines / relations ;
* 6 abstraites / ambiguës.

Total : **50 images**.

Le catalogue doit notamment conserver :

* identifiant ;
* nom de fichier ;
* famille visuelle ;
* thèmes de résonance ;
* intensité ;
* phase ;
* sensibilité éventuelle ;
* licence ;
* source ;
* auteur ;
* URL ;
* note éditoriale interne.

### Règle importante

Une image ne doit pas être choisie uniquement parce qu'elle "illustre" le texte.

Une certaine ambiguïté est recherchée.

---

# 11. CONTENU ÉDITORIAL

Les textes de RÉSONANCE peuvent être inspirés par des idées issues notamment de :

* Jung ;
* Osho ;
* l'Évangile de Thomas ;
* autres traditions philosophiques ou introspectives.

Mais les textes intégrés à RÉSONANCE doivent être **originaux**.

Ils ne doivent pas être des paraphrases trop proches de textes existants.

L'inspiration peut nourrir :

* une idée ;
* une question ;
* une tension ;
* une image mentale ;
* une formulation originale.

---

# 12. QUESTIONS ET INVITATIONS

Les questions peuvent porter notamment sur :

* l'attraction ;
* le rejet ;
* le détail ;
* l'émotion ;
* la projection ;
* le personnel ;
* le déplacement ;
* la temporalité.

Elles ne doivent pas suggérer la réponse.

Exemple acceptable :

> "Qu'est-ce qui t'attire ici ?"

Exemple à éviter :

> "Est-ce que cette image représente ta peur de l'abandon ?"

---

# 13. CARNET

Le carnet est une pièce centrale de l'expérience.

Il conserve notamment :

* date ;
* question éventuelle ;
* images montrées ;
* image choisie ;
* images rejetées ;
* réaction ;
* texte personnel ;
* mots-clés éventuels ;
* émotions éventuellement exprimées ;
* insight formulé par le joueur ;
* question ouverte ;
* action éventuelle.

Le carnet doit conserver la trace de l'expérience telle qu'elle a réellement été vécue.

Les contenus rencontrés pendant une session doivent rester historiquement cohérents : une modification ultérieure du catalogue ne doit pas réécrire rétroactivement ce que le joueur a rencontré.

---

# 14. COMPTE UTILISATEUR — DÉCISION PRODUIT

**Décision : le compte ne doit jamais être une barrière à l'entrée.**

Le joueur doit pouvoir :

1. arriver ;
2. jouer ;
3. vivre l'expérience ;
4. obtenir son carnet ;
5. télécharger son carnet ;

sans créer de compte.

Le compte devient intéressant **après que RÉSONANCE a apporté de la valeur**.

Proposition de formulation :

> **Conserver mon carnet dans RÉSONANCE**

L'objectif du compte est notamment de permettre :

* de retrouver ses expériences ;
* de conserver ses carnets ;
* de poursuivre une expérience ;
* d'observer son évolution dans le temps ;
* de retrouver ses données depuis un autre appareil.

### Règle essentielle

Si un joueur crée un compte après avoir joué, son expérience déjà réalisée doit pouvoir être **rattachée à son compte sans être rejouée**.

Il ne doit jamais être placé devant :

> "Crée un compte pour recommencer."

L'expérience vécue doit rester acquise.

### Principe produit

> **Tu peux partir. Mais si tu veux, RÉSONANCE se souvient de toi.**

Cette logique doit guider l'architecture future du compte et du carnet.

---

# 15. IA

L'IA est volontairement absente du socle nécessaire au fonctionnement du jeu.

Elle pourra éventuellement intervenir plus tard pour :

* reformuler ;
* mettre en relation ;
* poser des questions ;
* faire émerger des observations ;
* présenter des évolutions ;
* montrer certaines contradictions ou ruptures.

Elle ne doit jamais :

* diagnostiquer ;
* profiler ;
* affirmer une vérité psychologique ;
* attribuer une cause cachée à un comportement ;
* dire au joueur ce qu'il "est".

L'IA intervient donc **à terme**, une fois que le jeu fonctionne correctement sans elle.

---

# 16. ANGLE MORT

L'angle mort n'est jamais une affirmation.

Il peut être formulé comme une question ou une hypothèse ouverte.

Jamais :

> "Voici ton angle mort."

Plutôt :

> "Une chose semble moins présente dans tes choix. Est-ce que cela te parle ?"

Le joueur reste libre d'accepter, de rejeter ou d'ignorer cette hypothèse.

---

# 17. PROGRESSION

La progression de RÉSONANCE est personnelle.

Elle ne doit pas prendre la forme d'une montée de niveaux psychologiques.

Des éléments ludiques peuvent néanmoins matérialiser l'expérience :

* collections ;
* cartes ;
* traces ;
* fragments ;
* chemins ;
* constellations ;
* découvertes.

Le jeu peut donner envie de revenir sans transformer le joueur en "profil".

---

# 18. SESSIONS FUTURES

Plusieurs types de sessions peuvent exister à terme :

* libre ;
* question ;
* miroir ;
* contraste ;
* retour ;
* images évitées ;
* évolution ;
* synthèse.

Ces modes doivent rester des propositions d'expérience, pas des tests psychologiques.

---

# 19. MODÈLE ÉCONOMIQUE — ORIENTATION STRATÉGIQUE

Orientation actuellement privilégiée :

> **RÉSONANCE pourrait être gratuit pour le joueur.**

L'objectif est notamment d'éviter un modèle nécessitant :

* prospection ;
* devis ;
* facturation ;
* gestion de clients ;
* SAV commercial ;
* rendez-vous commerciaux.

Une monétisation indirecte pourrait être envisagée ultérieurement :

* affiliation ;
* recommandations de livres ;
* carnets ;
* jeux de cartes ;
* ouvrages photographiques ;
* ateliers ;
* partenaires cohérents avec l'univers de RÉSONANCE ;
* éventuellement fonctionnalités premium ;
* éventuellement dons ou soutien.

### Règle absolue

La monétisation ne doit jamais influencer :

* les tirages ;
* les choix ;
* les interprétations ;
* les récurrences ;
* les contenus présentés au joueur.

Aucun produit affilié ne doit devenir une réponse implicite à un supposé problème psychologique du joueur.

La priorité actuelle n'est donc **pas la monétisation**.

La priorité est :

> **Créer une expérience suffisamment bonne pour que les gens aient envie de jouer et de revenir.**

---

# 20. PHILOSOPHIE PRODUIT

Le principal actif de RÉSONANCE n'est pas la technologie.

C'est la qualité de l'expérience.

Avant d'ajouter :

* IA ;
* comptes complexes ;
* monétisation ;
* gamification ;
* fonctionnalités sociales ;

il faut vérifier que le cœur du jeu fonctionne :

> texte → tirage → choix → expression → mémoire → retour.

La question centrale n'est pas :

> "Qu'est-ce qu'on peut ajouter ?"

mais :

> **"Est-ce que cette expérience donne réellement envie de continuer ?"**

---

# 21. CONTINUITÉ DU PROJET

Ce fichier est la mémoire externe officielle du projet.

Les décisions importantes doivent y être ajoutées afin de ne pas dépendre uniquement de la mémoire des conversations.

Chaque élément nouveau doit être classé mentalement comme :

* **DÉCIDÉ** : règle ou choix adopté ;
* **EN RÉFLEXION** : piste sérieuse mais non figée ;
* **IDÉE** : possibilité non engagée ;
* **À FAIRE PLUS TARD** : décision prise mais volontairement différée.

Une hypothèse ne doit jamais être transformée silencieusement en décision.

---

# 22. RÔLE DES INTERVENANTS

### Muse / outils de développement

Construisent et modifient le code.

### ChatGPT / réflexion produit

Le rôle est notamment de :

* maintenir la continuité du projet ;
* challenger les idées lorsque nécessaire ;
* faire émerger les incohérences ;
* travailler l'expérience utilisateur ;
* travailler le contenu ;
* travailler les règles du jeu ;
* travailler l'architecture fonctionnelle ;
* anticiper les conséquences des décisions ;
* documenter les décisions importantes.

Le rôle n'est pas de micro-superviser inutilement chaque détail de code lorsque celui-ci ne change pas le produit.

### Principe

> **Le code fait fonctionner RÉSONANCE.
> La conception décide ce que RÉSONANCE doit devenir.**

---

# 23. PROCHAINES PRIORITÉS

Ordre de priorité général :

1. Valider réellement l'expérience jouable existante.
2. Vérifier la qualité du parcours complet.
3. Enrichir et structurer le corpus éditorial.
4. Constituer une photothèque réellement exploitable.
5. Tester la répétition / récurrence sur plusieurs expériences.
6. Améliorer progressivement le carnet.
7. Concevoir proprement le futur système de compte et de rattachement du carnet.
8. Tester le retour des joueurs.
9. Seulement ensuite envisager sérieusement IA et monétisation.

---

# 24. RÈGLE DE CONTINUITÉ ABSOLUE

Lorsqu'une nouvelle conversation reprend RÉSONANCE :

**ne pas repartir de zéro.**

Commencer par considérer ce fichier comme l'état de référence, puis distinguer :

* ce qui est déjà décidé ;
* ce qui est effectivement implémenté ;
* ce qui reste à tester ;
* ce qui est en réflexion ;
* ce qui n'est qu'une idée.

Ne jamais présenter une hypothèse comme une décision.

Ne jamais prétendre qu'une vérification, une recherche ou une modification a été effectuée si elle ne l'a pas réellement été.

