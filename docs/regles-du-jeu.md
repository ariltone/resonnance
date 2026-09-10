# Règles du jeu

> Version lisible sur GitHub du fichier source : `regle du jeu.odt` (conservé à la racine du dépôt).

---

# RÉSONANCE — CAHIER DES RÈGLES DU JEU

Version 1.0 — Document de conception

### 1. Objet du document

Le présent document définit les règles précises qui régissent le fonctionnement du jeu RÉSONANCE.

Il constitue le niveau intermédiaire entre :

- le cahier des charges fonctionnel, qui définit l'intention et l'expérience recherchée ;
- le cahier des charges technique, qui définit les moyens permettant de construire l'application.

Il a pour objectif de rendre le fonctionnement du jeu suffisamment explicite pour que son développement puisse être réalisé sans interprétation des mécanismes fondamentaux.

Ce document ne définit pas l'architecture logicielle, les technologies utilisées ni la conception graphique détaillée.

## 2. Principe fondamental

RÉSONANCE est une expérience introspective fondée sur la rencontre entre :

un texte → des images → un choix → une perception → une résonance → une mise en perspective.

Le joueur n'est pas soumis à un test psychologique.

Il ne cherche pas à trouver une « bonne réponse ».

Il ne doit pas être amené à découvrir ce que l'application pense de lui.

Le principe fondamental est :

Le joueur donne du sens à ce qu'il choisit. L'application ne donne pas de sens à sa place.

L'application peut mettre en évidence des rapprochements, des répétitions ou des contradictions observables dans le parcours.

Elle ne doit pas transformer ces observations en diagnostic.

## 3. Structure générale du jeu

Une partie est constituée d'une succession de séquences de résonance.

Chaque séquence comporte généralement :

- une mise en disponibilité du joueur ;
- la présentation d'un texte ;
- la présentation d'un ensemble de formes ou d'images ;
- un choix intuitif ;
- un temps d'expression ou d'interprétation ;
- l'enregistrement de la séquence ;
- éventuellement une mise en relation avec les choix précédents ;
- la poursuite du parcours.

Le jeu doit conserver une part d'incertitude.

Le joueur ne doit jamais pouvoir déduire mécaniquement :

« Si je choisis cette image, alors le jeu va me faire passer à telle étape. »

## 4. Le rôle du hasard

Le hasard est une composante fondamentale de RÉSONANCE.

Il sert à empêcher le joueur de construire consciemment une stratégie de réponse.

Le hasard peut intervenir dans :

- la sélection des textes ;
- la sélection des images ;
- l'ordre d'apparition des images ;
- la combinaison texte/images ;
- certains événements du parcours.

Cependant :

Le hasard ne doit jamais produire une expérience incohérente.

Il doit être utilisé comme un outil de déstabilisation douce, pas comme un générateur arbitraire de contenu.

## 5. La séquence de résonance

### 5.1 Présentation du texte

Une séquence commence par l'apparition d'un texte.

Le texte peut être :

- une phrase ;
- un court passage ;
- une question ;
- une affirmation ;
- une situation ;
- un fragment narratif ;
- une formulation volontairement ouverte.

Le texte ne doit pas nécessairement être explicitement « psychologique ».

Il peut fonctionner par évocation.

#### Règle

Le joueur doit avoir accès au texte avant le choix des images lorsque la séquence repose sur une résonance texte → image.

## 6. Présentation des images

Après lecture du texte, plusieurs images ou formes sont proposées.

Le nombre exact doit être paramétrable.

La valeur initiale recommandée est :

6 images.

Les images doivent être suffisamment différentes pour permettre une véritable préférence, mais aucune ne doit être présentée comme la réponse attendue.

## 7. Le choix

Le joueur choisit une seule image parmi celles qui lui sont proposées.

Le choix doit être présenté comme intuitif.

Le système peut utiliser une formulation telle que :

« Laquelle résonne le plus avec ce que tu viens de lire ? »

ou une formulation équivalente.

Le système ne doit pas demander :

« Quelle image représente le mieux le texte ? »

car cette formulation transforme le jeu en exercice d'interprétation rationnelle.

## 8. Le joueur reste souverain

Le choix appartient exclusivement au joueur.

L'application ne doit jamais :

- corriger le choix ;
- indiquer qu'un choix est intéressant ou mauvais ;
- attribuer une signification fixe à une image ;
- révéler une interprétation cachée ;
- présenter le choix comme une preuve d'un trait de personnalité.

Une image n'a donc pas de signification psychologique prédéfinie.

Sa valeur provient de la relation :

joueur + texte + contexte + moment + choix.

## 9. Après le choix

Une fois l'image choisie, plusieurs mécanismes sont possibles.

Selon la séquence, le jeu peut demander au joueur :

- ce qui l'a attiré ;
- ce qu'il voit dans l'image ;
- ce qu'elle lui évoque ;
- ce qu'elle lui fait ressentir ;
- pourquoi elle lui paraît juste ;
- ou simplement lui laisser poursuivre sans explication.

Il est important que l'expression ne soit pas obligatoire à chaque fois.

Le silence peut également constituer une donnée du parcours.

## 10. L'image comme miroir

L'image choisie ne doit jamais être traitée comme un symbole universel.

Par exemple :

❌ « Tu as choisi une porte, donc tu as peur du changement. »

Mais éventuellement :

« Tu as choisi cette image. Qu'est-ce qui, dans cette porte, t'a retenu ? »

La différence est fondamentale.

RÉSONANCE ne cherche pas :

ce que l'image signifie.

Il cherche :

ce que cette image signifie pour cette personne, à cet instant.

## 11. La récurrence

Au fil du parcours, le système peut détecter des récurrences.

Par exemple :

- une même image choisie plusieurs fois ;
- une famille visuelle récurrente ;
- une couleur dominante ;
- une forme ;
- un thème apparaissant plusieurs fois ;
- une opposition entre plusieurs choix ;
- une évolution des choix.

Cependant, une récurrence constitue uniquement :

une observation.

Elle ne constitue pas une conclusion.

Le système peut donc dire :

« Cette forme revient plusieurs fois dans ton parcours. »

Mais pas :

« Tu choisis cette forme parce que tu refuses le changement. »

## 12. La résonance différée

Un élément peut prendre un sens différent plusieurs étapes plus tard.

RÉSONANCE doit donc permettre qu'une première réponse reste ouverte.

Une image choisie au début peut réapparaître plus tard.

Le joueur peut alors être invité à constater :

« Tu avais choisi cette image au début. Aujourd'hui, tu la regardes autrement ? »

Cette mécanique est importante car elle introduit une notion de temps dans l'introspection.

Le joueur n'est pas analysé à partir d'une photographie instantanée.

Son parcours évolue.

## 13. Les contradictions

Une contradiction entre deux choix n'est pas considérée comme une erreur.

Exemple :

- le joueur choisit une image évoquant l'ouverture ;
- plus tard, il choisit une image évoquant la fermeture.

Le système ne doit pas conclure :

« Tu es contradictoire. »

Il peut plutôt proposer :

« Deux images très différentes sont apparues dans ton parcours. Est-ce que tu vois un lien entre elles ? »

La contradiction devient ainsi une matière de réflexion.

## 14. L'angle mort

L'angle mort constitue un mécanisme particulier du jeu.

Il doit être présenté comme une hypothèse, jamais comme une vérité.

Le système peut formuler :

« Et si quelque chose t'échappait ici ? »

ou :

« Une autre lecture est-elle possible ? »

L'objectif n'est pas de révéler au joueur une vérité cachée.

L'objectif est de lui permettre d'envisager une possibilité qu'il n'avait pas spontanément envisagée.

#### Règle essentielle

L'angle mort doit rester au conditionnel.

Il ne doit jamais devenir :

« Ton problème est… »

mais :

« Et si… ? »

## 15. Le joueur peut refuser l'interprétation

Le joueur doit pouvoir considérer qu'une proposition ne lui correspond pas.

Il peut :

- l'ignorer ;
- la rejeter ;
- la modifier ;
- proposer sa propre lecture ;
- poursuivre sans commentaire.

L'application doit accepter le refus sans chercher à convaincre.

## 16. Progression

La progression ne repose pas nécessairement sur un système de points.

Il n'y a pas :

- de score ;
- de classement ;
- de réussite ;
- d'échec ;
- de mauvaise réponse.

La progression correspond à l'avancement du parcours.

Le joueur avance parce qu'il traverse des séquences, pas parce qu'il obtient un résultat.

## 17. Fin d'une partie

Une partie doit comporter un moment de clôture.

La clôture ne doit pas être une conclusion psychologique.

Elle doit être une restitution du chemin parcouru.

Elle peut faire apparaître :

- les images choisies ;
- les textes rencontrés ;
- certaines phrases du joueur ;
- les récurrences ;
- les évolutions ;
- les questions laissées ouvertes ;
- les éléments auxquels le joueur souhaite revenir.

## 18. Le « Je suis »

La finalité du parcours peut conduire à une formulation personnelle du joueur.

Cette formulation ne doit pas être générée comme un diagnostic.

Elle doit être construite ou validée par le joueur.

Le « Je suis » constitue une formulation identitaire ou directionnelle issue du parcours.

Il peut évoluer.

Il n'est pas nécessairement définitif.

Le système doit privilégier :

« Voici ce que tu sembles vouloir affirmer. »

plutôt que :

« Voici qui tu es. »

## 19. Le carnet

Chaque séquence importante peut être enregistrée dans le carnet.

Une entrée peut contenir :

- le texte présenté ;
- les images proposées ;
- l'image choisie ;
- la date ;
- les réponses du joueur ;
- les éventuelles réflexions ;
- les éléments de récurrence identifiés ultérieurement.

Le carnet constitue la mémoire du parcours.

Il ne doit pas simplement être une archive technique.

Il doit permettre au joueur de regarder son propre chemin.

## 20. Retour en arrière

Le joueur doit pouvoir consulter les éléments précédents.

Cependant, revenir consulter une séquence ne doit pas nécessairement permettre de modifier rétroactivement son choix initial.

Principe :

L'histoire du parcours est conservée.

Si le jeu permet une seconde lecture d'une séquence, celle-ci doit être enregistrée comme une nouvelle interaction plutôt que d'effacer la précédente.

## 21. Sessions

Une partie peut être :

- courte ;
- moyenne ;
- longue ;
- interrompue puis reprise.

Le système doit donc distinguer :

partie commencée

partie en cours

partie terminée

partie abandonnée

Une interruption ne doit jamais être considérée comme un échec.

## 22. Rejouabilité

RÉSONANCE doit être rejouable.

Une nouvelle partie ne doit pas simplement reproduire le même parcours.

Le système doit pouvoir modifier :

- les textes ;
- les images ;
- les combinaisons ;
- l'ordre ;
- certaines mécaniques.

Cependant, certaines règles fondamentales restent constantes.

## 23. Ce qui doit rester aléatoire

Par défaut :

## 24. Ce qui doit être paramétrable

Le jeu doit prévoir des paramètres configurables sans modification du code.

Exemples :

- nombre d'images proposées ;
- nombre de séquences ;
- durée ou longueur d'une partie ;
- fréquence des interventions réflexives ;
- fréquence de l'angle mort ;
- activation ou désactivation de certaines mécaniques ;
- niveau d'intervention de l'IA ;
- types de contenus utilisés ;
- possibilité ou non de rejouer ;
- paramètres de conservation du carnet.

Ces paramètres seront détaillés dans le document de configuration administrateur.

## 25. Rôle de l'IA

L'IA est un assistant de mise en perspective, jamais un psychologue.

Elle peut :

- reformuler ;
- rapprocher deux éléments explicitement présents ;
- poser une question ;
- identifier une récurrence factuelle ;
- proposer plusieurs pistes ;
- aider le joueur à approfondir sa propre formulation.

Elle ne doit pas :

- diagnostiquer ;
- attribuer une pathologie ;
- déterminer la personnalité ;
- affirmer une cause psychologique ;
- prétendre connaître l'inconscient du joueur ;
- manipuler le joueur vers une conclusion ;
- présenter une hypothèse comme une vérité.

## 26. Principe de neutralité de l'IA

L'IA doit privilégier :

« Peut-être… »

« Est-ce que… ? »

« Une autre possibilité serait… »

« Tu sembles avoir choisi… »

plutôt que :

« Tu es… »

« Tu as peur de… »

« Ton problème est… »

« Cela signifie que… »

## 27. Données et observation

Le moteur de RÉSONANCE peut exploiter les données du parcours pour détecter des phénomènes.

Il peut constater :

« Tu as choisi trois fois une image contenant une ouverture. »

Il ne peut pas transformer automatiquement cette observation en :

« Tu cherches à t'échapper. »

Le passage entre observation et interprétation doit toujours rester visible.

## 28. Règle de souveraineté

Cette règle doit être considérée comme l'une des règles cardinales du jeu.

Le système peut proposer une lecture. Le joueur reste libre de l'accepter, de la modifier ou de la rejeter.

Aucune mécanique ne doit enfermer le joueur dans une interprétation.

## 29. Absence de notation

RÉSONANCE ne note pas le joueur.

Aucun choix ne doit être :

- meilleur ;
- pire ;
- plus profond ;
- plus courageux ;
- plus sain ;
- plus évolué.

Le jeu ne mesure pas une personne.

Il accompagne un parcours.

## 30. Principe de confidentialité du parcours

Le carnet est considéré comme un espace personnel.

Les éléments produits par le joueur doivent être traités comme des données potentiellement sensibles du point de vue de leur contenu.

La conception fonctionnelle devra donc prévoir :

- accès contrôlé ;
- suppression ;
- export éventuel ;
- conservation configurable ;
- séparation entre données nécessaires au fonctionnement et données personnelles du parcours.

Les modalités précises seront définies dans le document RGPD/confidentialité.

## 31. Règle de cohérence globale

Chaque mécanique de RÉSONANCE doit être évaluée selon trois questions :

#### 1. Est-elle ludique ?

Le joueur doit avoir envie de continuer.

#### 2. Est-elle projective ?

Elle doit laisser suffisamment d'espace au joueur pour produire son propre sens.

#### 3. Respecte-t-elle sa souveraineté ?

Elle ne doit jamais prétendre savoir à sa place.

Une mécanique qui échoue sur l'un de ces trois critères doit être réévaluée.

## 32. Les trois niveaux du jeu

Pour éviter toute confusion dans le développement, RÉSONANCE distingue trois niveaux.

#### Niveau 1 — Ce qui s'est passé

Les faits du parcours.

Exemple :

« Tu as choisi cette image. »

#### Niveau 2 — Ce que le joueur en dit

Son propre sens.

Exemple :

« Cette image m'a donné une impression de liberté. »

#### Niveau 3 — Ce que le système propose

Une mise en relation ou une question.

Exemple :

« La liberté revient plusieurs fois dans ton parcours. Qu'est-ce qu'elle représente aujourd'hui ? »

Ces trois niveaux ne doivent jamais être confondus.

## 33. Principe directeur

L'ensemble des règles de RÉSONANCE peut finalement être résumé ainsi :

RÉSONANCE ne cherche pas à découvrir qui est le joueur.

Il crée les conditions pour que le joueur puisse se découvrir lui-même.

L'application fournit :

des textes, des images, du hasard, des questions, des miroirs et de la mémoire.

Le joueur fournit :

le choix, le sens, le doute, le refus, la parole et finalement sa propre formulation.

## 34. Règle absolue

Si une fonctionnalité améliore la sophistication du jeu mais réduit la liberté d'interprétation du joueur, la liberté du joueur prime.

Si une fonctionnalité rend le jeu plus « intelligent » mais donne l'illusion que l'application connaît mieux le joueur que lui-même, elle doit être refusée ou reformulée.

Si une fonctionnalité rend le jeu plus complexe sans enrichir la résonance, elle doit être supprimée.

### 35. Paramètres à figer avant développement

Avant de considérer le moteur de jeu comme spécifié, les valeurs suivantes devront être arrêtées :
