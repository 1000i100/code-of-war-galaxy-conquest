# variable par défaut
name = "IA 1nomable" # nom de l'IA
color = 0 #  couleur d'affichage
debugMessage="" # message de debugage utilisé par le systeme et affiché dans la trace à chaque tour du combat
id = 0 # Id de l'IA

# variable maison
orderCall = 0

# constante de jeu connu :
croissanceParTour = 5


###
  @internal method
###
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
	result = []
	try
		myPlanets = GameUtil.getPlayerPlanets( id, context )
		otherPlanets = GameUtil.getEnnemyPlanets(id, context)
		if otherPlanets != null && otherPlanets.length > 0
			for myPlanet in myPlanets
	#			if myPlanet.population > otherPlanets.length
	#				for planet in otherPlanets
	#					result.push new Order( myPlanet.id, planet.id, 1 )
				target = getEasyestPlanet(myPlanet,otherPlanets)
				populationGoal = 1 + naturalPopInXTurn(target, GameUtil.getTravelNumTurn(myPlanet,target))
				if myPlanet.population > populationGoal
					result.push new Order( myPlanet.id, target.id, populationGoal )
		orderCall++
		debugMessage = 'Tour '+orderCall
		#debugMessage+= ' planete attr : '+naturalPopInXTurn(myPlanets[0],100)
	catch e
		debugMessage += e
	return result

naturalPopInXTurn = (planet, turn) ->
	Math.min(planet.population + turn*croissanceParTour, PlanetPopulation.getMaxPopulation(planet.size))

getNearestPlanet = (source, candidats) ->
	result = candidats[ 0 ]
	currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) )
	for element in candidats
		dist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )
		if  currentDist > dist
			currentDist = dist
			result = element
	return result

getEasyestPlanet = (source, candidats) ->
	result = candidats[0]
	minDifficulty = naturalPopInXTurn candidats[0], GameUtil.getTravelNumTurn(source,candidats[0])
	for element in candidats
		difficulty = naturalPopInXTurn element, GameUtil.getTravelNumTurn(source,element)
		if minDifficulty > difficulty
			minDifficulty = difficulty
			result = element
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

	@getEnnemyFleet : (playerId,context) ->
		result = []
		for s in context.fleet
			if s.owner.id != playerId
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
