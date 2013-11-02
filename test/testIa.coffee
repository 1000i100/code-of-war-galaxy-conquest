describe 'Test runner', ->
	it 'execute a dummy test', ->
		(1+1).should.equal 2
###
avoir la liste des planêtes et des vaisseaux avec leur effectif et effectif max et horaire et destination d'impact pour les vaisseau

timePlanet idPlanet nbrTour
retourne l'estimation de l'état de la planete dans nbrTour (population estimé, propriétaire estimé)


comportements :
envoyer du monde ailleur quand une planète saturera avant la prochaine prise d'ordre.
envoyer suffisement de monde vers une planête a soit que l'on peut atteindre avant qu'un vaisseau adverse en route ne l'atteigne
envoyer suffisement de monde (multi origine) pour prendre une planête tel qu'elle sera à l'arrivé du dernier vaisseau
prioriser les cibles qu'aucun vaisseau ennemi ne pourra atteindre avant nous.
prioriser les planêtes ennemi proche de nous et éloigné des autres planêtes ennemi au planêtes neutre
prioriser (légèrement) les grosse planêtes
prioriser les planêtes proches
prioriser les planêtes facile à capturer (peu de population)

garder une population proche du maximum sur les planêtes proche de l'ennemi en vidant celle qui peuvent être renforcée par des vaiseau ami avant l'arrivé d'un vaisseau ennemi

ne jamais envoyer de vaisseau > à la capacité d'accueil de la cible + 1

éviter de rendre vulnérable une planète (population restant sur la planète +Régen > population envoyable par l'ennemi sans renfort possible de notre part )

envoyer des renfort sur-numéraire pour sécuriser une planête avec attaque plannifié exemple :
Planete ami 1 loin   pop:100 pop max:200
Planete ami 2 proche pop:50 pop max:50
Planete ennemi 3 proche pop:60 pop max:75

PA1 envoi 50 de renfort à PA2 et 26 à PE3
1 tour avant l'arrivé des renforts, PA2 envoi 50 sur PE3 sans se mettre en danger puisque les renfort arriveront avant quoi que ce soit de l'adversaire.
50 + 26 arrivent sur PE3 qui est donc conquise à coup sur.

Si une planête ami va être perdu et que l'évacuer avant l'arrivé adverse fait saturer la planète (et donc perdre de la pop à l'adversaire) l'évacuer
et envoyer une riposte pour le tour après colonisation en évitant la saturation de la planète de destination de l'évacuation.

faire circuler des vaisseaux entre planêtes proche de la saturation pour leur permetre de continuer à produire (surtout si aucune planêtes adverse n'est accessible)

garder comme objectif principal : à chaque tour, un max de planête doivent produire pour nous
objectif 2 : à chaque tour, un minimum de plannêtes doivent produire pour l'ennemi
choisir les cibles offensive sur ces critères.


si j'ai l'avantage en nombre de planètes, maximiser les pertes adverses
si il à l'avantage en nombre de planètes, minimiser mes pertes



###
