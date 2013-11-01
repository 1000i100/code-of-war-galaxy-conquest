# variable par défaut
color = 0 #  couleur d'affichage
debugMessage="" # message de debugage utilisé par le systeme et affiché dans la trace à chaque tour du combat
id = 0 # Id de l'IA

# variable maison
actualTurn = 0
a = 'a' # propriétaire ami (nous)
e = 'e' # propriétaire ennemi
n = 'n' # propriétaire neutre
futurMax = 13 # innutile d'aller plus loins dans le futur, il n'y aura rien de plus vu que les trajets les plus long fond 13 tours.
leurres = false

# constante de jeu connu :
croissanceParTour = 5


@onmessage = (event) ->
	if event.data?
		turnMessage = event.data
		id = turnMessage.playerId
		postMessage( new TurnResult( getOrders(turnMessage.galaxy), debugMessage) )
	else postMessage("data null")

###
  Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
  C'est la methode à modifier pour cabler son IA.
  @param context:Galaxy
  @return result:Array<Order>
###
getOrders = (context) ->
	debugMessage='<br>Tour '+actualTurn+'<br>'
	for p in context.content
		debugMessage+=getOwner(p)+','
	result = []
	try
		myPlanets = GameUtil.getPlayerPlanets( id, context )
		otherPlanets = GameUtil.getEnnemyPlanets(id, context)
		if otherPlanets != null && otherPlanets.length > 0
			for myPlanet in myPlanets

				# cible facile
				targets = getEasyPlanets(myPlanet,context,otherPlanets)
				target = targets[Math.floor(Math.random()*targets.length)]
				travelTime = GameUtil.getTravelNumTurn(myPlanet,target)
				targetFutur = planeteInXTurn(target, context, travelTime)
				populationGoal = 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet,target)).population
				if myPlanet.population > populationGoal
					result.push new Order( myPlanet.id, target.id, populationGoal )
					myPlanet.population -= populationGoal

				# évacuation anti trop plein
				if planeteInXTurn(myPlanet, context, 1).population >= PlanetPopulation.getMaxPopulation(myPlanet.size)
					target = getEasyestPlanet(myPlanet,context,otherPlanets)
					populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet,target)).population)
					result.push new Order(myPlanet.id, target.id, populationGoal)
					myPlanet.population -= populationGoal

				# évacuation pro saturation adverse
				# si vaisseau adverse arrive au prochain tour et que le bilan de population de tous les vaisseau en route vers la planète à un solde en faveur de l'ennemi > popMax
				# alors évacuer vers la destination la plus proche convertible ou amie (plusieurs vaisseaux en cas de saturation)
				ennemisEnRoute = getShipGoingTo myPlanet, GameUtil.getEnnemyFleets(id,context)
				landNextTurn = false
				for ship in ennemisEnRoute
					landNextTurn=true if 1 == getShipLandingTurn(ship)-actualTurn
				if landNextTurn
					puissanceAdverse = 0
					for ship in ennemisEnRoute
						puissanceAdverse += ship.crew
					if puissanceAdverse > PlanetPopulation.getMaxPopulation(myPlanet.size)
						result = evacTotal(myPlanet, context, result)

				if planeteInXTurn(myPlanet, context, 1).population >= PlanetPopulation.getMaxPopulation(myPlanet.size)
					target = getEasyestPlanet(myPlanet,context,otherPlanets)
					populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet,target)).population)
					result.push new Order(myPlanet.id, target.id, populationGoal)

				# armée de leurres
				if leurres
					for planet in context.content
						if planet != myPlanet
							result.push new Order( myPlanet.id, planet.id, 0 )

	catch err
		debugMessage += err
	actualTurn++
	return result

evacTotal = (myPlanet, context, result) ->
	# TODO : orderByDistance
	target = getNearestPlanet myPlanet, context.content
	result.push new Order(myPlanet.id, target.id, myPlanet.population)
	return result


naturalPopInXTurn = (planet, turn) ->
	Math.min(planet.population + turn*croissanceParTour, PlanetPopulation.getMaxPopulation(planet.size))

planeteInXTurn = (planet, context, turn) ->
	pclone =
		size: planet.size
		population: planet.population
		owner: planet.owner
		id: planet.id
		x: planet.x
		y: planet.y
		ref: planet
	pop = pclone.population-5
	fleet = getShipGoingTo pclone.ref, context.fleet
	for t in [0..turn]
		for s in fleet
			if getShipLandingTurn(s) == actualTurn+t
				if s.owner == pclone.owner
					pop = Math.min(pop+s.crew, PlanetPopulation.getMaxPopulation(pclone.size))
				else
					pop = pop-s.crew
					if pop<0
						pop = -pop
						pclone.owner = s.owner
		pop = Math.min(pop+croissanceParTour, PlanetPopulation.getMaxPopulation(pclone.size))
	pclone.population = pop
	return pclone
getOwner = (element) ->
	if element.owner.color == 13421772 then return n
	if element.owner.id == id then return a
	else return e

getShipLandingTurn = (ship) ->
	ship.creationTurn+ship.travelDuration
getShipGoingTo = (planet, candidats) ->
	result = []
	for s in candidats
		if s.target == planet
			result.push s
	return result


getNearestPlanet = (source, candidats) ->
	result = candidats[ 0 ]
	currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) )
	for element in candidats
		dist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )
		if  currentDist > dist
			currentDist = dist
			result = element
	return result

getEasyestPlanet = (source, context, candidats) ->
	candidats = context.content if !candidats
	result = candidats[0]
	travelTime = GameUtil.getTravelNumTurn(source,candidats[0])
	pl = planeteInXTurn(result, context, travelTime)
	if pl.owner == result.owner
		minDifficulty = pl.population
	else
		minDifficulty = 9999
	for element in candidats
		travelTime = GameUtil.getTravelNumTurn(source,element)
		pl = planeteInXTurn(element, context, travelTime)
		if pl.owner == element.owner
			difficulty = pl.population
		else
			difficulty = 9999
		if minDifficulty > difficulty
			minDifficulty = difficulty
			result = element
	return result

getEasyPlanets = (source, context, candidats) ->
	easyest = getEasyestPlanet(source, context, candidats)
	travelTime = GameUtil.getTravelNumTurn(source,easyest)
	pl = planeteInXTurn(easyest, context, travelTime)
	if pl.owner == easyest.owner
		minDifficulty = pl.population
	else
		minDifficulty = 9999
	result = []
	for element in candidats
		travelTime = GameUtil.getTravelNumTurn(source,element)
		pl = planeteInXTurn(element, context, travelTime)
		if pl.owner == element.owner
			difficulty = pl.population
		else
			difficulty = 9999
		if difficulty <= minDifficulty+10
			result.push element
	return result


###
  @model Galaxy
  @param width:Number largeur de la galaxy
  @param height:Number hauteur de la galaxy
###
class Galaxy
	constructor: (@width,@height) ->
		###contenu : liste Planet###
		@content = []
		###flote : liste de Ship###
		@fleet = []


###
  @model Range
  @param from:Number début de l'intervale
  @param to:Number fin de l'intervale
###
class Range
	constructor: (@from,@to) ->


###
  @model Order
  @param sourceID:Number id de la planete d'origine
  @param targetID:Number id de la planete cible
  @param numUnits:Number nombre d'unité à déplacer
###
class Order
	constructor: (@sourceID,@targetID,@numUnits) ->

###
  @model Planet
  @param x:Number position en x
  @param y:Number position en y
  @param size:Number taille
  @param owner:Player proprietaire
###
class Planet
	constructor: (@x,@y,@size,@owner) ->
		### population###
		@population = PlanetPopulation.getDefaultPopulation(size);
		### id ###
		@id = UID.get();


###
  @model Ship
  @param crew:Number equipage
  @param source:Planet origine
  @param target:Planet cible
  @param creationTurn:Number numero du tour de creation du vaisseau
###
class Ship
	constructor: (@crew,@source,@target,@creationTurn) ->
		### proprietaire du vaisseau###
		@owner = source.owner;
		### duree du voyage en nombre de tour###
		@travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / Game.SHIP_SPEED);

###
  @internal model
###
class TurnMessage
	constructor: (@playerId,@galaxy) ->

###
  @internal model
###
class TurnResult
	constructor: (@orders,@consoleMessage = "") ->
		@error = ""

###
  @model Point
  @param x:Number
  @param y:Number
###
class Point
	constructor: (@x,@y) ->

###
  Classe utilitaire
###
class GameUtil
	###
	  @param p1:Point
	  @param p2:Point
	  @return result:Number la distance entre deux points
	###
	@getDistanceBetween : (p1,p2) ->
		Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2))

	###
	  @param planetOwnerId:Number
	  @param context:Galaxy
	  @return result:Array<Planet> la liste des planetes appartenants à un joueur en particulier
	###
	@getPlayerPlanets: (planetOwnerId,context) ->
		result = []
		for p in context.content
			if p.owner.id == planetOwnerId
				result.push p
		return result
	###
	 @param planetOwnerId:Number
	 @param context:Galaxy
	 @return result:Array<Planet> la liste des planetes ennemies et neutres
	###
	@getEnnemyPlanets : (planetOwnerId,context) ->
		result = []
		for p in context.content
			if p.owner.id != planetOwnerId
				result.push p
		return result

	@getEnnemyFleets : (playerId,context) ->
		result = []
		for s in context.fleet
			if s.owner.id != playerId
				result.push s
		return result

	@getMyFleets : (playerId,context) ->
		result = []
		for s in context.fleet
			if s.owner.id == playerId
				result.push s
		return result

	@getTravelNumTurn : (source,target) ->
		return Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / Game.SHIP_SPEED)






###
  Classe utilitaire
  @internal
###
class UID
	@lastUID : 0
	@get : () ->
		UID.lastUID++
		return UID.lastUID


###
  Constantes
###
class Game
	@DEFAULT_PLAYER_POPULATION : 100;
	@NUM_PLANET : new Range(5,10);
	@PLANET_GROWTH : 5;
	@SHIP_SPEED : 60;
	@GAME_SPEED : 500;
	@GAME_DURATION : 240;
	@GAME_MAX_NUM_TURN : 500;

class PlanetPopulation
	@DEFAULT_SMALL : 20;
	@DEFAULT_NORMAL : 30;
	@DEFAULT_BIG : 40;
	@DEFAULT_HUGE : 50;
	@MAX_SMALL : 50;
	@MAX_NORMAL : 100;
	@MAX_BIG : 200;
	@MAX_HUGE : 300;
	@getMaxPopulation : (planetSize) ->
		result = 1
		switch planetSize
			when PlanetSize.SMALL then result = PlanetPopulation.MAX_SMALL
			when PlanetSize.NORMAL then result = PlanetPopulation.MAX_NORMAL
			when PlanetSize.BIG then result = PlanetPopulation.MAX_BIG
			when PlanetSize.HUGE then result = PlanetPopulation.MAX_HUGE
		return result

	@getDefaultPopulation : (planetSize) ->
		result = 1;
		switch planetSize
			when PlanetSize.SMALL then result = PlanetPopulation.DEFAULT_SMALL
			when PlanetSize.NORMAL then result = PlanetPopulation.DEFAULT_NORMAL
			when PlanetSize.BIG then result = PlanetPopulation.DEFAULT_BIG
			when PlanetSize.HUGE then result = PlanetPopulation.DEFAULT_HUGE
		return result

class PlanetSize
	@SMALL : 1
	@NORMAL : 2
	@BIG : 3
	@HUGE : 4
