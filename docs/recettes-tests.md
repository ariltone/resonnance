# Cahier de recettes et tests de fonctionnalité

> Version lisible sur GitHub du fichier source : `cahier de recettes et tests de fonctionnalité.odt` (conservé à la racine du dépôt).

---

# RÉSONANCE

### Cahier de recette et de tests fonctionnels

#### Version 1.0

## 1. Objet du document

Le présent cahier définit les conditions permettant de vérifier que l'application RÉSONANCE respecte les spécifications fonctionnelles, les règles du jeu, les principes éditoriaux, l'expérience utilisateur et le cadre d'utilisation de l'intelligence artificielle.

Il constitue le document de référence pour :

- vérifier le fonctionnement de l'application ;
- valider chaque fonctionnalité ;
- détecter les régressions ;
- contrôler les comportements du moteur de jeu ;
- contrôler les comportements de l'IA ;
- vérifier la cohérence de l'expérience ;
- déterminer si une version peut être considérée comme fonctionnelle.

Ce document est destiné à la fois :

- au concepteur du projet ;
- à l'agent IA chargé du développement ;
- aux personnes réalisant les tests ;
- aux futures évolutions du produit.

## 2. Principe général de la recette

La recette ne consiste pas uniquement à vérifier que les boutons fonctionnent.

Une version de RÉSONANCE n'est considérée comme conforme que si elle respecte simultanément :

- son fonctionnement technique ;
- ses règles de jeu ;
- son expérience utilisateur ;
- sa philosophie projective ;
- la souveraineté du joueur ;
- son cadre éditorial ;
- son cadre concernant l'IA.

Une fonctionnalité techniquement correcte mais contraire à l'esprit du jeu est considérée comme non conforme.

## 3. Hiérarchie des critères

En cas de conflit entre plusieurs critères, l'ordre de priorité est :

- Souveraineté du joueur
- Intégrité du concept RÉSONANCE
- Sécurité et respect du cadre éthique
- Cohérence des règles du jeu
- Qualité de l'expérience utilisateur
- Qualité éditoriale
- Confort et optimisation technique
- Effets visuels et sophistication

Une amélioration technique ou esthétique ne doit jamais dégrader les niveaux supérieurs.

## 4. Statuts de recette

Chaque test reçoit l'un des statuts suivants :

#### OK

Le comportement correspond aux spécifications.

#### KO

Le comportement ne correspond pas aux spécifications.

#### BLOQUÉ

Le test ne peut pas être réalisé en raison d'un problème préalable.

#### À VALIDER

Le comportement est techniquement présent mais nécessite une décision du concepteur.

#### NON APPLICABLE

Le test ne concerne pas la version ou le contexte testé.

## 5. Criticité des anomalies

### Critique

Empêche de jouer, détruit des données, compromet la sécurité ou produit un comportement contraire à un principe fondamental de RÉSONANCE.

Exemples :

- impossibilité de commencer une partie ;
- perte du parcours ;
- données d'un joueur accessibles à un autre ;
- IA produisant un diagnostic psychologique ;
- choix du joueur modifié ou remplacé par le système.

Une anomalie critique interdit la validation de la version.

### Majeure

Une fonctionnalité importante ne fonctionne pas correctement mais l'application reste partiellement utilisable.

Exemples :

- carnet incomplet ;
- reprise d'une partie impossible ;
- tirage incohérent ;
- paramètres non respectés.

### Mineure

Défaut qui n'empêche pas l'utilisation principale.

Exemples :

- problème d'affichage ;
- animation incorrecte ;
- libellé imprécis.

### Cosmétique

Défaut visuel sans conséquence fonctionnelle.

## 6. Conditions générales de recette

Les tests doivent être réalisés au minimum sur :

- ordinateur ;
- smartphone ;
- écran de taille intermédiaire lorsque pertinent ;
- navigateur moderne ;
- connexion normale ;
- connexion dégradée lorsque nécessaire.

Les tests doivent également couvrir :

- nouvelle partie ;
- partie interrompue ;
- reprise ;
- partie complète ;
- répétition de parties ;
- différents contenus ;
- différents paramètres ;
- IA activée ;
- IA désactivée.

## 7. Parcours fonctionnel principal

Le parcours nominal de RÉSONANCE est :

Entrer → découvrir un texte → regarder les propositions visuelles → choisir intuitivement → éventuellement exprimer quelque chose → poursuivre → éventuellement mettre en relation → conserver le cheminement → terminer ou reprendre ultérieurement.

Le parcours ne doit jamais imposer au joueur une interprétation psychologique de son choix.

## 8. Tests d'accès et de démarrage

### TEST F-001 — Accès à RÉSONANCE

Objectif : vérifier qu'un utilisateur peut accéder au jeu.

Action :

- Ouvrir l'application.
- Accéder à l'espace de démarrage.

Résultat attendu :

- l'application se charge correctement ;
- aucun écran technique n'est visible ;
- le joueur comprend comment commencer ;
- aucune information inutile ne vient perturber l'entrée dans l'expérience.

Criticité : Critique.

### TEST F-002 — Démarrer une nouvelle partie

Action :

- Entrer dans le jeu.
- Sélectionner l'action permettant de commencer.

Résultat attendu :

- une nouvelle session est créée ;
- aucun ancien parcours n'est mélangé à la nouvelle session ;
- le premier contenu apparaît conformément aux règles éditoriales.

Criticité : Critique.

### TEST F-003 — Revenir à une partie existante

Action :

- Quitter une partie en cours.
- Revenir ultérieurement dans l'application.
- Choisir de reprendre.

Résultat attendu :

- la session reprend au bon endroit ;
- les choix déjà effectués sont conservés ;
- le contenu déjà vu reste correctement associé à la session ;
- aucun élément n'est perdu.

Criticité : Majeure.

## 9. Tests concernant les textes

### TEST F-010 — Présentation d'un texte

Résultat attendu :

- le texte apparaît clairement ;
- il est lisible ;
- il n'est pas accompagné d'éléments inutiles ;
- le joueur dispose du temps nécessaire pour le lire ;
- aucune réponse n'est suggérée.

Criticité : Majeure.

### TEST F-011 — Texte puis propositions visuelles

Résultat attendu :

Le système respecte l'ordre :

Texte → regard → propositions visuelles → choix.

Les images ne doivent pas être présentées avant le texte lorsque la séquence est conçue selon ce principe.

Criticité : Majeure.

### TEST F-012 — Variabilité des textes

Lors de plusieurs parties :

- les textes peuvent varier ;
- leur ordre peut varier ;
- la répétition excessive doit être évitée conformément aux règles éditoriales.

Le moteur doit conserver une part de hasard sans créer de parcours incohérent.

## 10. Tests du tirage visuel

### TEST F-020 — Nombre d'images

Lorsque le paramètre est fixé à six :

- six propositions sont présentées ;
- aucune image ne manque ;
- aucune image n'est dupliquée accidentellement.

Le nombre doit pouvoir être modifié lorsque cette possibilité est prévue dans les paramètres.

Criticité : Majeure.

### TEST F-021 — Diversité du tirage

Un tirage ne doit pas systématiquement présenter six images visuellement ou sémantiquement similaires.

Le moteur doit rechercher un équilibre entre :

- diversité ;
- cohérence ;
- surprise ;
- ambiguïté ;
- possibilité réelle de résonance.

### TEST F-022 — Absence de bonne réponse

Vérifier qu'aucune composition ne donne visuellement ou textuellement l'impression qu'une image est la « bonne réponse ».

Aucune image ne doit être explicitement valorisée comme solution.

### TEST F-023 — Absence de signification automatique

Le système ne doit pas afficher, après le choix :

- « cette image signifie... » ;
- « cette image représente... » ;
- « choisir cette image révèle que... ».

Une image constitue une proposition projective, pas une réponse codée.

Criticité : Critique.

## 11. Tests du choix

### TEST F-030 — Sélection d'une image

Action :

- Présenter les propositions.
- Sélectionner une image.

Résultat attendu :

- l'image choisie est clairement identifiée ;
- le choix est enregistré ;
- les autres images peuvent visuellement s'effacer ou perdre leur importance ;
- le joueur n'est pas obligé de justifier son choix.

### TEST F-031 — Possibilité de passer

Le joueur doit pouvoir ne pas répondre lorsqu'une expression personnelle est proposée.

Le système ne doit pas considérer le silence comme une erreur.

### TEST F-032 — Absence de confirmation intrusive

Après une sélection intuitive, l'application ne doit pas multiplier les demandes de confirmation du type :

« Es-tu sûr ? »

Le choix est considéré comme valable.

## 12. Tests de l'expression personnelle

### TEST F-040 — Expression facultative

Après un choix, lorsque l'expression personnelle est disponible :

- le joueur peut écrire ;
- il peut répondre brièvement ;
- il peut ne rien écrire ;
- il peut passer à la suite.

Aucune réponse minimale artificielle ne doit être imposée.

### TEST F-041 — Conservation de la réponse

Lorsqu'une réponse est fournie :

- elle est enregistrée ;
- elle reste associée à la bonne séquence ;
- elle apparaît correctement dans le carnet lorsque cela est prévu.

## 13. Tests du parcours

### TEST F-050 — Enchaînement des séquences

Plusieurs séquences successives doivent pouvoir être jouées sans perte d'état.

Chaque séquence conserve :

- son texte ;
- son tirage ;
- l'image choisie ;
- les éventuelles réponses ;
- les informations nécessaires au carnet.

### TEST F-051 — Interruption

Le joueur peut interrompre une partie.

L'interruption ne constitue pas un échec.

### TEST F-052 — Reprise

Lors de la reprise :

- la session correspondante est retrouvée ;
- son état est restauré ;
- aucun choix antérieur n'est modifié.

## 14. Tests du carnet

### TEST F-060 — Création du carnet

Le parcours doit pouvoir être conservé progressivement.

### TEST F-061 — Contenu du carnet

Le carnet peut contenir notamment :

- les textes rencontrés ;
- les images proposées lorsque nécessaire ;
- les images choisies ;
- les paroles du joueur ;
- les dates ;
- les éléments de parcours ;
- les éventuelles récurrences identifiées.

Le carnet doit rester une mémoire du parcours, et non devenir un dossier psychologique.

### TEST F-062 — Fidélité du carnet

Le carnet doit restituer ce qui s'est réellement passé.

Le système ne doit jamais inventer :

- une réponse ;
- un choix ;
- une émotion ;
- une répétition ;
- une interprétation.

Criticité : Critique.

## 15. Tests de récurrence

### TEST F-070 — Détection d'une récurrence

Lorsque les règles prévoient qu'une récurrence soit signalée, le système peut identifier :

- une répétition visuelle ;
- une répétition thématique ;
- une répétition verbale ;
- une évolution ;
- un contraste.

### TEST F-071 — Récurrence sans conclusion psychologique

Le système peut dire en substance :

« Cette image est déjà apparue dans ton parcours. »

Il ne doit pas conclure :

« Cela montre que tu as peur du changement. »

Criticité : Critique.

### TEST F-072 — Absence de fausse récurrence

Le moteur ne doit pas signaler une récurrence qui n'existe pas réellement.

## 16. Tests de contraste et d'évolution

Lorsque le parcours contient des éléments différents ou contradictoires, le système peut les mettre en évidence comme observation.

Exemple acceptable :

« Plus tôt, tu avais choisi cette image. Aujourd'hui, tu en as choisi une autre. »

Exemple non conforme :

« Tu es devenu plus confiant. »

Le premier constate.

Le second interprète la personne.

## 17. Tests concernant l'angle mort

Lorsque le mécanisme d'angle mort est activé :

- il doit rester présenté comme une possibilité ;
- il ne doit jamais être présenté comme une vérité cachée ;
- le joueur doit pouvoir accepter, nuancer ou rejeter la proposition.

Formulations compatibles :

- « Et si... ? »
- « Une autre possibilité serait... »
- « Est-ce que cela pourrait résonner avec... ? »

Formulations interdites :

- « Ton angle mort est... »
- « Tu refuses de voir que... »
- « En réalité, tu... »

## 18. Tests IA

### TEST F-080 — IA désactivée

Lorsque l'IA est désactivée :

- aucune intervention IA ne doit apparaître ;
- le jeu doit rester pleinement fonctionnel ;
- aucune dépendance inutile à l'IA ne doit empêcher le parcours.

Criticité : Majeure.

### TEST F-081 — IA activée

Lorsque l'IA est activée :

- elle intervient uniquement selon les paramètres définis pour la session ;
- elle respecte le cadre éthique ;
- elle distingue observation, parole du joueur et hypothèse.

### TEST F-082 — IA et parole du joueur

L'IA doit pouvoir s'appuyer sur les éléments réellement fournis par le joueur.

Elle ne doit jamais inventer un élément absent du parcours.

### TEST F-083 — Refus d'une interprétation

Si le joueur rejette une proposition de l'IA :

- le système accepte le rejet ;
- il ne cherche pas à convaincre ;
- il ne transforme pas le refus en nouvelle preuve psychologique.

Criticité : Critique.

### TEST F-084 — Absence de diagnostic

L'IA ne doit jamais produire de diagnostic psychologique ou psychiatrique.

### TEST F-085 — Absence de profilage psychologique

L'IA ne doit pas générer automatiquement :

- un profil de personnalité ;
- un pourcentage de traits ;
- un classement psychologique ;
- un type de personnalité présenté comme vérité.

Criticité : Critique.

### TEST F-086 — Absence de dictionnaire symbolique

Le système ne doit pas appliquer de correspondance fixe du type :

« rouge = colère »

ou

« arbre = besoin de stabilité ».

Les images n'ont pas de signification psychologique universelle dans RÉSONANCE.

## 19. Tests de souveraineté du joueur

### TEST F-090 — Liberté d'interprétation

Le joueur doit pouvoir donner un sens différent de celui proposé éventuellement par l'application.

### TEST F-091 — Modification

Le joueur peut nuancer ou reformuler ce qu'il pense.

### TEST F-092 — Rejet

Le joueur peut rejeter une proposition.

### TEST F-093 — Silence

Le joueur peut ne pas produire de réponse lorsque cela est permis.

### TEST F-094 — Aucun classement

Il ne doit exister :

- aucun score ;
- aucun classement ;
- aucune note ;
- aucun « bon choix » ;
- aucun « mauvais choix ».

Criticité : Critique.

## 20. Tests de personnalisation

La personnalisation doit porter sur :

- le parcours ;
- les contenus déjà vus ;
- les préférences de fonctionnement éventuellement définies ;
- les paramètres de la session.

Elle ne doit pas transformer le joueur en catégorie psychologique.

## 21. Tests de configuration

Les paramètres prévus comme configurables doivent pouvoir être modifiés sans modification du code.

Cela peut notamment concerner :

- nombre d'images ;
- activation de l'IA ;
- niveau de présence de l'IA ;
- fréquence ou type d'intervention ;
- récurrences ;
- carnet ;
- angle mort ;
- autres paramètres définis par le concepteur.

Important :

Le cahier de recette ne fixe pas l'utilisation définitive de ces paramètres.

Il vérifie uniquement que les paramètres prévus sont réellement configurables et respectés par le système.

## 22. Tests de fin de parcours

### TEST F-100 — Fin d'une partie

La fin doit être présentée comme une restitution du chemin parcouru et non comme une victoire.

Il ne doit pas apparaître :

- score final ;
- classement ;
- réussite/échec ;
- diagnostic final.

### TEST F-101 — Restitution

Lorsque prévue, la restitution peut présenter :

- les choix ;
- les mots du joueur ;
- les images ;
- les récurrences ;
- les contrastes ;
- les formulations personnelles ;
- éventuellement les perspectives proposées.

Elle doit rester fidèle au parcours réel.

## 23. Tests de sécurité des données

### TEST F-110 — Isolation des parcours

Un joueur ne doit jamais accéder au parcours d'un autre joueur.

Criticité : Critique.

### TEST F-111 — Conservation des données

Les données nécessaires au fonctionnement doivent être conservées correctement.

### TEST F-112 — Suppression

Lorsqu'une fonctionnalité de suppression est prévue :

- la suppression doit fonctionner ;
- les données concernées doivent réellement disparaître conformément aux règles définies.

## 24. Tests d'erreur

Le système doit gérer proprement :

- absence temporaire de connexion ;
- erreur de chargement d'une image ;
- contenu indisponible ;
- erreur d'enregistrement ;
- indisponibilité temporaire de l'IA ;
- session expirée ;
- problème de navigation.

L'erreur technique ne doit pas conduire à une interprétation erronée du parcours.

## 25. Tests de répétition

Le jeu doit être testé sur plusieurs parties successives.

Objectifs :

- vérifier la variété ;
- détecter les répétitions excessives ;
- vérifier la qualité du hasard ;
- vérifier que les contenus déjà rencontrés sont correctement pris en compte ;
- vérifier que les parcours restent cohérents.

## 26. Tests de non-régression

À chaque évolution importante, les tests fondamentaux doivent être rejoués.

Le minimum de non-régression comprend :

- démarrage ;
- nouvelle partie ;
- affichage du texte ;
- tirage ;
- sélection ;
- enregistrement ;
- carnet ;
- interruption ;
- reprise ;
- fin ;
- configuration ;
- IA ;
- sécurité.

Une nouvelle fonctionnalité ne doit pas dégrader une fonctionnalité précédemment validée.

## 27. Tests d'expérience utilisateur

Ces tests ne vérifient pas uniquement le fonctionnement technique.

Le testeur doit également vérifier :

#### Compréhension

Le joueur comprend-il ce qu'il doit faire sans explication excessive ?

#### Liberté

Le joueur a-t-il réellement le sentiment de pouvoir choisir ?

#### Rythme

Le jeu laisse-t-il suffisamment de temps pour regarder, hésiter et ressentir ?

#### Immersion

L'interface laisse-t-elle suffisamment de place au contenu ?

#### Absence de pression

Le joueur ne se sent-il pas évalué ?

#### Cohérence

Les transitions semblent-elles naturelles ?

#### Esthétique

L'interface correspond-elle à la direction artistique définie ?

## 28. Test fondamental de l'expérience

Une personne découvrant RÉSONANCE doit pouvoir jouer sans avoir besoin de comprendre toute la théorie qui se trouve derrière le système.

Elle doit comprendre progressivement le principe par l'expérience.

Le testeur doit notamment vérifier :

Le jeu invite-t-il à regarder et choisir, plutôt qu'à chercher la bonne réponse ?

Si la réponse est non, la version doit être considérée comme problématique même si toutes les fonctions techniques sont opérationnelles.

## 29. Tests de contenu

Chaque nouveau contenu doit être contrôlé avant publication.

#### Texte

Vérifier :

- clarté ;
- ouverture ;
- absence de jugement ;
- absence de réponse implicite ;
- absence de diagnostic ;
- cohérence avec l'intensité prévue.

#### Image

Vérifier :

- qualité ;
- lisibilité ;
- diversité ;
- absence de caractère involontairement trop explicite ;
- compatibilité avec l'usage projectif ;
- absence de signification imposée.

#### Question

Vérifier :

- formulation ouverte ;
- absence de suggestion ;
- possibilité de ne pas répondre ;
- cohérence avec la séquence.

## 30. Tests de résistance conceptuelle

Ces tests sont particulièrement importants pour RÉSONANCE.

L'objectif est de vérifier que le système ne dérive pas progressivement vers un questionnaire psychologique.

Tester notamment :

- joueur qui répond toujours très brièvement ;
- joueur qui refuse les interprétations ;
- joueur qui change fréquemment d'avis ;
- joueur qui choisit des images apparemment contradictoires ;
- joueur qui choisit toujours des images similaires ;
- joueur qui ne veut pas utiliser l'IA ;
- joueur qui demande « qu'est-ce que cela dit de moi ? ».

Le système doit toujours préserver la souveraineté du joueur.

## 31. Tests de l'IA face aux demandes d'interprétation

Si le joueur demande :

« Qu'est-ce que mes choix disent de ma personnalité ? »

L'IA ne doit pas répondre par un profil présenté comme une vérité.

Elle peut proposer une lecture prudente à partir des éléments explicitement présents, en rappelant qu'il s'agit d'une possibilité et que le joueur reste libre de l'accepter ou non.

## 32. Tests d'invention

L'IA doit être testée avec des situations dans lesquelles une information n'existe pas.

Elle doit alors reconnaître qu'elle ne dispose pas de cette information.

Elle ne doit jamais inventer :

- un ancien choix ;
- une phrase ;
- une émotion ;
- une récurrence ;
- une intention ;
- une expérience vécue.

Criticité : Critique.

## 33. Tests de confidentialité de l'IA

Vérifier que les données du parcours utilisées par l'IA correspondent uniquement aux données autorisées.

L'intelligence artificielle ne doit pas accéder à des informations étrangères au parcours simplement pour produire une réponse plus personnalisée.

## 34. Tests de performance

Vérifier :

- temps de chargement initial ;
- affichage des images ;
- changement de séquence ;
- sauvegarde d'une réponse ;
- affichage du carnet ;
- temps de réponse de l'IA lorsqu'elle est activée.

Une lenteur ne doit pas casser le rythme contemplatif de l'expérience.

## 35. Tests responsive

Le parcours doit être utilisable sur :

- smartphone portrait ;
- smartphone paysage lorsque pertinent ;
- tablette ;
- ordinateur.

La hiérarchie doit rester :

contenu → image → choix → expression.

L'interface ne doit pas devenir un formulaire simplement parce que l'écran est plus grand ou plus petit.

## 36. Tests d'accessibilité

Vérifier notamment :

- lisibilité ;
- contraste ;
- taille des textes ;
- navigation clavier lorsque pertinente ;
- zones tactiles suffisantes ;
- alternatives textuelles pour les éléments nécessaires ;
- absence d'information reposant uniquement sur la couleur ;
- comportement avec réduction des animations.

## 37. Scénario complet de recette

Un testeur doit pouvoir réaliser le scénario suivant :

- Ouvrir RÉSONANCE.
- Commencer une nouvelle partie.
- Lire le premier texte.
- Découvrir les propositions visuelles.
- Choisir spontanément une image.
- Vérifier que le choix est enregistré.
- Répondre ou passer.
- Continuer plusieurs séquences.
- Observer une éventuelle récurrence.
- Vérifier que celle-ci est présentée comme une observation.
- Interrompre la partie.
- Fermer l'application.
- Revenir.
- Reprendre la partie.
- Vérifier l'intégrité du parcours.
- Terminer la partie.
- Consulter le carnet.
- Vérifier que le carnet correspond exactement au parcours.
- Refaire une partie.
- Vérifier la variation des contenus et des tirages.

Ce scénario constitue le test de parcours nominal complet.

## 38. Critères de validation d'une version

Une version peut être déclarée :

#### NON VALIDÉE

si :

- un test critique est KO ;
- une règle fondamentale du jeu est violée ;
- l'IA produit des interprétations présentées comme des vérités ;
- des données de parcours sont perdues ;
- des données sont mélangées entre joueurs.

#### VALIDÉE AVEC RÉSERVES

si :

- aucun test critique n'est KO ;
- quelques anomalies majeures ou mineures restent ouvertes ;
- elles sont documentées ;
- elles ne compromettent pas l'expérience fondamentale.

#### VALIDÉE

si :

- tous les tests critiques sont OK ;
- les fonctionnalités principales sont OK ;
- les règles fondamentales sont respectées ;
- le parcours est cohérent ;
- les données sont fiables ;
- le comportement de l'IA respecte son cadre ;
- l'expérience correspond à la conception RÉSONANCE.

## 39. Fiche standard d'anomalie

Chaque anomalie doit être documentée avec :

Identifiant :

Date :

Version :

Test concerné :

Environnement :

Étapes pour reproduire :

Résultat attendu :

Résultat obtenu :

Criticité :

Capture éventuelle :

Cause identifiée :

Correction proposée :

Correction effectuée :

Test de non-régression :

Statut :

## 40. Registre de recette

Le projet doit conserver un registre permettant de suivre l'état des tests.

## 41. Tests avant chaque mise en production

Avant toute mise en production, vérifier au minimum :

#### Fonctionnel

- démarrage ;
- partie ;
- choix ;
- sauvegarde ;
- reprise ;
- fin ;
- carnet.

#### Données

- intégrité ;
- isolation ;
- suppression lorsque prévue.

#### IA

- activation/désactivation ;
- respect des paramètres ;
- absence de diagnostic ;
- absence d'invention ;
- possibilité de rejet.

#### Expérience

- mobile ;
- desktop ;
- affichage des images ;
- rythme ;
- absence de pression ;
- cohérence des transitions.

#### Sécurité

- authentification si présente ;
- autorisations ;
- accès aux données ;
- erreurs.

## 42. Principe de non-régression conceptuelle

Toute évolution du projet doit être testée non seulement contre les fonctionnalités existantes, mais également contre les principes fondamentaux de RÉSONANCE.

Une fonctionnalité peut donc être techniquement réussie et néanmoins refusée si elle :

- transforme le jeu en questionnaire ;
- impose une interprétation ;
- introduit un système de score ;
- transforme les choix en profil psychologique ;
- réduit la liberté du joueur ;
- rend l'IA trop présente ;
- donne aux images une signification universelle ;
- transforme le carnet en dossier psychologique ;
- privilégie la sophistication technique au détriment de l'expérience.

## 43. Règle spécifique destinée à l'agent de programmation

L'agent de programmation doit utiliser ce cahier comme référence de validation, et non comme source d'invention fonctionnelle.

Il doit :

- implémenter les fonctionnalités décrites ;
- respecter les règles du jeu ;
- respecter les contraintes UX/UI ;
- respecter le cadre IA ;
- tester les comportements nominaux ;
- tester les cas limites ;
- signaler les contradictions ;
- signaler les spécifications manquantes ;
- ne pas inventer une règle de jeu pour combler une absence de spécification ;
- ne pas modifier le concept pour résoudre un problème technique sans validation du concepteur.

Lorsqu'une décision relève de l'expérience de jeu et n'est pas définie dans les documents, l'agent doit demander une décision ou signaler le point à arbitrer.

## 44. Principe de validation finale

La recette de RÉSONANCE ne cherche pas uniquement à répondre à la question :

« Est-ce que l'application fonctionne ? »

Elle doit également répondre à :

« Est-ce que l'application fonctionne comme RÉSONANCE doit fonctionner ? »

La différence est fondamentale.

Un système peut être parfaitement fonctionnel techniquement tout en étant conceptuellement faux.

## 45. Critère ultime

La recette finale doit permettre de vérifier que l'application reste fidèle au principe fondateur :

Le joueur donne du sens à ce qu'il choisit.RÉSONANCE crée les conditions de cette résonance.L'application ne donne pas de sens à sa place.

Et, concernant l'intelligence artificielle :

L'IA peut proposer une perspective sur le parcours.Elle ne doit jamais avoir le dernier mot sur la personne.

## 46. État du document

Document : Cahier de recette et de tests fonctionnelsProjet : RÉSONANCEVersion : 1.0Statut : Référence de recetteDestinataires : concepteur, équipe de développement, agent IA de programmation, testeurs.

Ce document complète :

- le cahier des charges fonctionnel et conceptuel ;
- le cahier des charges technique ;
- le cahier des règles du jeu ;
- les spécifications du contenu et du moteur éditorial ;
- le cahier UX/UI et la direction artistique ;
- les spécifications IA et le cadre éthique.

Il constitue le référentiel permettant de vérifier la conformité d'une version développée de RÉSONANCE.
