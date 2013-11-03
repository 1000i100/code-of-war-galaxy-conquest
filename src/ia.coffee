# variable maison
# IA antiJeu / réactive
tourActuel = 0
a = 'a' # propriétaire ami (nous)
e = 'e' # propriétaire ennemi
n = 'n' # propriétaire neutre
futurMax = 13 # innutile d'aller plus loins dans le futur, il n'y aura rien de plus vu que les trajets les plus long fond 13 tours.
leurres = true

# constante de jeu connu :
croissanceParTour = 5
vitesseVaisseau = 60

# variables globales
color = 0 #  couleur d'affichage
debugMessage="" # message de debugage utilisé par le systeme et affiché dans la trace à chaque tour du combat
id = 0 # mon Identifiant

orders = []
galaxy = {}

@onmessage = (event) ->
	if event.data?
		debugMessage='<br>Tour '+tourActuel+'<br>'
		id = event.data.playerId
		galaxy = event.data.galaxy
		ajouterPopMaxAuxPlanetes()
		orders = []
		getOrders()
		if leurres
			debugMessage = friture()
		postMessage( {orders:orders,consoleMessage:'<span style="color:white">'+debugMessage+'</span>',error:''})
		tourActuel++
	else postMessage("data null")

###
  Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
  C'est la methode à modifier pour cabler son IA.
  @return res:Array<Order>
###
getOrders = ->
	try
		flottesAdverse = vaisseauxEnnemi()
		if flottesAdverse.length > 0
			for vaisseau in flottesAdverse
				target = vaisseau.target
				myPlanet = getNearestPlanet target, mesPlanetes()
				tempsNecessaire = tourDeTrajet myPlanet, target
				tempsDispo = tourArriveCible(vaisseau)-tourActuel
				if tempsNecessaire >= tempsDispo and tourActuel < 10
					# contrer
					targetFutur = planeteInXTurn(target, tempsNecessaire)
					if e == diplomacie targetFutur
						populationGoal = 1 + targetFutur.population
						if myPlanet.population > populationGoal
							sendShip(myPlanet, target, populationGoal)
				if tempsNecessaire >= tempsDispo and tempsNecessaire-3 <= tempsDispo
					# contrer
					targetFutur = planeteInXTurn(target, tempsNecessaire)
					if e == diplomacie targetFutur
						populationGoal = 1 + targetFutur.population
						if myPlanet.population > populationGoal
							sendShip(myPlanet, target, populationGoal)
		# armée de leurres
		if leurres
			myPlanets = mesPlanetes()
			for myPlanet in myPlanets
				for planet in galaxy.content
					if planet != myPlanet
						sendShip(myPlanet, planet, 0)

		if tourActuel < 3
			return 0
		else
			myPlanets = mesPlanetes()
			if tourActuel < 20
				otherPlanets = planetesEnnemi()
			else
				otherPlanets = planetesEnnemiEtNeutre()
			if otherPlanets != null && otherPlanets.length > 0
				for myPlanet in myPlanets

					# cible facile
					targets = getEasyPlanets(myPlanet,otherPlanets)
					target = targets[Math.floor(Math.random()*targets.length)]
					travelTime = tourDeTrajet(myPlanet,target)
					targetFutur = planeteInXTurn(target, travelTime)
					populationGoal = 1 + planeteInXTurn(target, tourDeTrajet(myPlanet,target)).population
					if myPlanet.population > populationGoal
						sendShip(myPlanet, target, populationGoal)

					# évacuation anti trop plein
					if planeteInXTurn(myPlanet, 1).population >= myPlanet.maxPop
						target = getEasyestPlanet(myPlanet,planetesEnnemi())
						populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, tourDeTrajet(myPlanet,target)).population)
						sendShip(myPlanet, target, populationGoal)

					# évacuation pro saturation adverse
					# si vaisseau adverse arrive au prochain tour et que le bilan de population de tous les vaisseau en route vers la planète à un solde en faveur de l'ennemi > popMax
					# alors évacuer vers la destination la plus proche convertible ou amie (plusieurs vaisseaux en cas de saturation)
					ennemisEnRoute = vaisseauxEnApprocheDe myPlanet, vaisseauxEnnemi()
					if vaisseauxQuiArrivent(tourActuel,ennemisEnRoute).length # tourActuel pourrais être remplacé par tourActuel+1 pour partir le tour précédent l'attaque et non le tour même GN
						enApproche = vaisseauxEnApprocheDe myPlanet
						bilanBase = bilanHumain myPlanet
						pclone = clonerPlanete myPlanet
						pclone.population = 0
						bilanAvecEvac = bilanHumain pclone
						perteSupplementaireEnnemi = bilanAvecEvac.pertesEnnemi - bilanBase.pertesEnnemi
						mesPerteSupplementaire = bilanAvecEvac.mesPertes - bilanBase.mesPertes
						bilan = perteSupplementaireEnnemi - mesPerteSupplementaire
						debugMessage += '<span class="bilan">'+bilan+' perteEnnemi:'+perteSupplementaireEnnemi+' mesPertes:'+mesPerteSupplementaire+'</span>'
						debugMessage += '<br/><span class="bilan">'+bilanBase.maProd+'->'+bilanAvecEvac.maProd+'</span>'
						if bilan>0
							evacTotal myPlanet

					if planeteInXTurn(myPlanet, 2).population >= myPlanet.maxPop
						target = getEasyestPlanet(myPlanet,otherPlanets)
						populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, tourDeTrajet(myPlanet,target)).population)
						sendShip(myPlanet, target, populationGoal)
	catch err
		debugMessage += err

sendShip = (source, target, population) ->
	orders.push {sourceID:source.id,targetID:target.id,numUnits:population} #new Order
	if population
		galaxy.fleet.push(new Ship(population,source,target,tourActuel))
		source.population -= population

vaisseauxQuiArrivent = (tour,candidats=galaxy.fleet)->
	res = []
	for ship in candidats
		res.push(ship) if tour == tourArriveCible(ship)
	return res

evacTotal = (myPlanet) ->
	# TODO : orderByDistance
	target = getNearestPlanet myPlanet, planetesEnnemi()
	sendShip(myPlanet, target, myPlanet.population) if myPlanet.population

naturalPopInXTurn = (planet, turn) ->
	Math.min(planet.population + turn*croissanceParTour, planet.maxPop)

bilanHumain = (planete, tour=futurMax)->
	pclone = planete
	while planete.ref
		planete = planete.ref
	vaisseauxEnApproche = vaisseauxEnApprocheDe planete
	mesPertes = 0
	pertesEnnemi = 0
	maProd = 0
	prodEnnemi = 0

	for t in [tourActuel..(tourActuel+tour)]
		resTour = bilanPlanetePourLeTour pclone, t, vaisseauxEnApproche
		mesPertes += resTour.mesPertes
		pertesEnnemi += resTour.pertesEnnemi
		maProd += resTour.maProd
		prodEnnemi += resTour.prodEnnemi
		pclone = resTour.planete
	res =
		planete: pclone
		mesPertes: mesPertes
		pertesEnnemi: pertesEnnemi
		maProd: maProd
		prodEnnemi: prodEnnemi
	return res


bilanPlanetePourLeTour = (planete, tour,vaisseauxEnApproche)->
	#ce tour
	maintenant = tour
	pclone = clonerPlanete planete
	maPopAvant = 0
	popEnnemiAvant = 0
	maProd = 0
	prodEnnemi = 0

	maPopAvant = pclone.population if a == diplomacie pclone
	popEnnemiAvant = pclone.population if e == diplomacie pclone
	vaisseauxATraiter = vaisseauxQuiArrivent maintenant, vaisseauxEnApproche
	vAmi = mesVaisseaux vaisseauxATraiter
	vEnnemi = vaisseauxEnnemi vaisseauxATraiter
	for v in vAmi
		maPopAvant+=v.crew
		pclone.population+=v.crew if a == diplomacie pclone
		pclone.population-=v.crew if a != diplomacie pclone
		if pclone.population < 0
			pclone.owner = v.owner
			pclone.population = -pclone.population
	for v in vEnnemi
		popEnnemiAvant+=v.crew
		pclone.population+=v.crew if e == diplomacie pclone
		pclone.population-=v.crew if e != diplomacie pclone
		if pclone.population < 0
			pclone.owner = v.owner
			pclone.population = -pclone.population
	if a == diplomacie pclone
		maProd+= Math.max(0,Math.min(croissanceParTour,pclone.popMax-pclone.population))
	if e == diplomacie pclone
		prodEnnemi+= Math.max(0,Math.min(croissanceParTour,pclone.popMax-pclone.population))
	#production de fin de tour
	pclone.population+=croissanceParTour
	#suppression des exedents
	pclone.population=pclone.popMax if pclone.population>pclone.popMax
	# calcul des pertes
	if a == diplomacie pclone
		mesPertes= maPopAvant-pclone.population
		pertesEnnemi=popEnnemiAvant
	else if e == diplomacie pclone
		mesPertes= maPopAvant
		pertesEnnemi=popEnnemiAvant-pclone.population
	else
		mesPertes= maPopAvant
		pertesEnnemi=popEnnemiAvant

	res =
		planete: pclone
		mesPertes: mesPertes
		pertesEnnemi:pertesEnnemi
		maProd:maProd
		prodEnnemi:prodEnnemi
	return res

clonerPlanete = (planete)->
	res =
		size: planete.size
		population: planete.population
		maxPop: populationMax planete
		owner: planete.owner
		id: planete.id
		x: planete.x
		y: planete.y
		ref: planete
planeteInXTurn = (planet, turn) ->
	pclone = clonerPlanete planet
	pop = pclone.population-5 # pour compenser fait de boucler en commençant à 0 (pour prendre en compte les vaisseau envoyé ce tour-ci)
	fleet = vaisseauxEnApprocheDe pclone.ref
	for t in [0..turn]
		for s in fleet
			if tourArriveCible(s) == tourActuel+t
				if s.owner == pclone.owner
					pop = Math.min(pop+s.crew, pclone.maxPop)
				else
					pop = pop-s.crew
					if pop<0
						pop = -pop
						pclone.owner = s.owner
		pop = Math.min(pop+croissanceParTour, pclone.maxPop)
	pclone.population = pop
	return pclone

tourArriveCible = (ship) ->
	ship.creationTurn+ship.travelDuration
vaisseauxEnApprocheDe = (planet, candidats=galaxy.fleet) ->
	res = []
	for ship in candidats
		if ship.target == planet
			res.push ship
	return res


getNearestPlanet = (source, candidats) ->
	res = candidats[ 0 ]
	currentDist = distanceEntre( source, res )
	for element in candidats
		dist = distanceEntre( source, element )
		if  currentDist > dist and dist>0
			currentDist = dist
			res = element
	return res

getEasyestPlanet = (source, candidats) ->
	candidats = galaxy.content if !candidats
	res = candidats[0]
	travelTime = tourDeTrajet(source,candidats[0])
	pl = planeteInXTurn(res, travelTime)
	if pl.owner == res.owner
		minDifficulty = pl.population
	else
		minDifficulty = 9999
	for element in candidats
		travelTime = tourDeTrajet(source,element)
		pl = planeteInXTurn(element, travelTime)
		if pl.owner == element.owner
			difficulty = pl.population
		else
			difficulty = 9999
		if minDifficulty > difficulty
			minDifficulty = difficulty
			res = element
	return res

getEasyPlanets = (source, candidats) ->
	easyest = getEasyestPlanet(source, candidats)
	travelTime = tourDeTrajet(source,easyest)
	pl = planeteInXTurn(easyest, travelTime)
	if pl.owner == easyest.owner
		minDifficulty = pl.population
	else
		minDifficulty = 9999
	res = []
	for element in candidats
		travelTime = tourDeTrajet(source,element)
		pl = planeteInXTurn(element, travelTime)
		if pl.owner == element.owner
			difficulty = pl.population
		else
			difficulty = 9999
		if difficulty <= minDifficulty+10
			res.push element
	return res

class Ship
	constructor: (@crew,@source,@target,@creationTurn) ->
		@owner = source.owner;
		@travelDuration = Math.ceil(distanceEntre(source,target) / vitesseVaisseau);

diplomacie = (element) ->
	if element.owner.color == 13421772 then return n
	if element.owner.id == id then return a
	else return e
mesPlanetes=(candidats=galaxy.content)->
	res = []
	for p in candidats
		if diplomacie(p) == a
			res.push p
	return res
planetesEnnemi=(candidats=galaxy.content)->
	res = []
	for p in candidats
		if diplomacie(p) == e
			res.push p
	return res
planetesNeutre=(candidats=galaxy.content)->
	res = []
	for p in candidats
		if diplomacie(p) == n
			res.push p
	return res
planetesEnnemiEtNeutre=(candidats=galaxy.content)->
	res = []
	for p in candidats
		if diplomacie(p) != a
			res.push p
	return res
mesVaisseaux = (candidats=galaxy.fleet)->
	res = []
	for s in candidats
		if s.owner.id == id and s.crew>0
			res.push s
	return res
vaisseauxEnnemi = (candidats=galaxy.fleet)->
	res = []
	for s in candidats
		if s.owner.id != id and s.crew>0
			res.push s
	return res
tourDeTrajet = (source,target) ->
	Math.ceil(distanceEntre(source,target) / vitesseVaisseau)
distanceEntre = (source,target) ->
	Math.sqrt(Math.pow(target.x - source.x,2) + Math.pow(target.y - source.y,2))


ajouterPopMaxAuxPlanetes = ->
	for p in galaxy.content
		p.maxPop = populationMax p
populationMax = (planet) ->	Math.max(50,(planet.size-1)*100)

friture = ->
	nbrChr = 140
	chrAutorise = '#?!§*$£¤&@%µ#!¤#'
	res = ''
	for i in [0..nbrChr]
		res+=chrAutorise.substr(Math.floor(Math.random()*chrAutorise.length),1)
	return res
