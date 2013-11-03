# Code of war
Faite s'affronter des intelligences artificielles dans un jeu de conquète spacial style Galaxy Conquest, Planetary Wars, Galcon ou Eufloria

Nom du projet sur le site Tamina Online, organisateur du concours : [Expantion Orignin, Creative Coding Contest](http://www.tamina-online.com/expantion-origin/).

# &gt;&gt; [Tester maintenant](http://gammanu.github.io/code-of-war-galaxy-conquest/?auto) &lt;&lt;
Vous pouvez lancer des parties avec les IA disponnible sans inscription au concours.
Pour configurer les réglages de partie, enlevez ?auto de l'url de démo, faite vos réglages, cliquez sur **Initialiser** puis **FIGHT** ou **Générer les statistiques**

Amusez vous bien !

## Principe

- L'affrontement se déroule dans une galaxie comprenant un certain nombre de planètes.
- La population de chaque planète augmente avec le temps jusqu'au maximum de la planète.
- Les deux IA s'affrontent pour le contrôle d'un maximum de planète.
- Chaque IA possède au départ une planète.
- Chaque IA peut envoyer dans un vaisseau une partie de sa population vers une autre planète.
- Si la population d'un vaisseau de colonisation est superieur à celle de la planète cible, la planète change de camp.


Les instructions détaillées avec le déroulement d'un tour de jeu et les conditions de victoire sont accessibles sur [le site du concours, page Instructions](http://www.tamina-online.com/expantion-origin/node/13)

## Licence

Attention, bien que déposé sur github en dépot public, certains codes ne sont qu'une copie de code déjà accessible publiquement, mais leurs droits d'auteur appartiennent à leur auteurs respectifs.

Les IA présente dans otherIA/ sont là à titre d'exemple et appartiennent à leur auteurs respectifs, elles sont extraite du des partie faisable après inscription sur le site du concours. [rubrique : Le Jeu > Jouer](http://www.tamina-online.com/expantion-origin/eo_dashboard)

Le code de base du jeu permettant de tester vos IA est fourni par [Tamina-Online en bas de page](http://www.tamina-online.com/expantion-origin/node/14#footer) la version originale en Haxe n'est à ma connaissance pas disponible.

Le process de build du Cakefile ainsi que mon IA (dans src/) sont fourni en [licence WTF](http://fr.wikipedia.org/wiki/WTFPL) ( faite en ce que vous voulez, open ou non, en me citant ou non )

PS : je décline toute responsabilité en cas de plantage du navigateur (ou quoi que ce soit d'autre d'ailleurs)

## installation

Téléchargez le projet ou clonez le via git

Installez [node.js](http://nodejs.org/) (et npm s'il n'est pas installé avec)
puis tapez en console (marche aussi avec la console windows) :

'''
cd DossierDuProjet
npm install -g coffee-script
npm install
cake watch
'''

## problèmes connus :

[Restrictions with Local Access](http://www.tamina-online.com/expantion-origin/node/14#footer)

Due to Google Chrome's security restrictions, workers will not run locally (e.g. from file://) in the latest versions of the browser. Instead, they fail silently! To run your app from the file:// scheme, run Chrome with the --allow-file-access-from-files flag set. NOTE: It is not recommended to run your primary browser with this flag set. It should only be used for testing purposes and not regular browsing.
Other browsers do not impose the same restriction.

Certaines IA sont très gourmandes en ressources et le script d'execution local ne semble pas exempt de fuites mémoires vu la baisse de performance sur les dernières parties lors des tests statistiques (raison pour laquelle le test se fait sur 10 parties et non 100)
