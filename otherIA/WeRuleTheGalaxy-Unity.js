/*!
 * PlanetWars Javascript Basic IA exemple
 * http://www.tamina-online.com/expantionreloded/
 *
 *
 * Copyright 2013 Tamina
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * author : david mouton
 */
 
/**
* nom de l'IA
*/
var name = "basicIA_JS";

/**
 * couleur d'affichage
*/
var color = 0;

/** message de debugage
 *  utilisé par le systeme et affiché dans la trace à chaque tour du combat
*/
var debugMessage="";

/* Id de l'IA */
var id = 0;

/**
 * @internal method
*/
onmessage = function(event)
{
	if(event.data != null) {
		var turnMessage = event.data;
		id = turnMessage.playerId;
		postMessage(new TurnResult( getOrders(turnMessage.galaxy), debugMessage));
	} 
	else postMessage("data null");
};

/**
 * Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
 * C'est la methode à modifier pour cabler son IA.
 * @param context:Galaxy
 * @return result:Array<Order>
*/
var getOrders = function(context) {
	var result = new Array();
	var myPlanets = GameUtil.getPlayerPlanets( id, context );
	var otherPlanets = GameUtil.getEnnemyPlanets(id, context);
	// Lors du départ
	if ( otherPlanets != null && otherPlanets.length > 0 && myPlanets.length == 1 )	{
		for ( var i = 0; i<myPlanets.length; i++ )
		{
			var myPlanet = myPlanets[ i ];
			var target = getNearestPlanet(myPlanet,otherPlanets);
			var target2 = getNearest2emePlanet(myPlanet,otherPlanets); 

			// Cas de 2 petites planètes proches
			if(target.size == 1 && myPlanet.population >=110) {
				result.push( new Order( myPlanet.id, target.id, 51 ) );
				result.push( new Order( myPlanet.id, target2.id, 51 ) );
				
			} else {
			// Sinon attaquer en masse la plus proche
				if(target.size != 1 && myPlanet.population >= 100){
					result.push( new Order( myPlanet.id, target.id, 100 ) );
				}
			}
		}
	}

	/*switch (target.size)
		{
			case 1 :
			result.push( new Order( myPlanet.id, target.id, 40 ) );
			break;

			case 2 :
			result.push( new Order( myPlanet.id, target.id, 50 ) );
			break;

			case 3 :
			result.push( new Order( myPlanet.id, target.id, 60 ) );
			break;

			case 4 :
			result.push( new Order( myPlanet.id, target.id, 70 ) );
			break;
		}	
	*/
	// NE PAS ATTAQUER LES BIG & HUGES PLANETES si on a le meme nb de planete, voir un peu moins : laissez faire l'ennemi.
	// Attaquer les petites planetes puis les moyennes planetes en priorité. Faire une méthode.

	//compter le nombre de planete size = 1 : Si <= 2, attaquer les autres, sinon attaquer par petite troupe
	// jusqu'à avoir >= moitié des size=1. 

	//http://www.tamina-online.com/expantion-origin/api/content/com/tamina/planetwars/data/Galaxy.html
	//http://www.tamina-online.com/expantion-origin/api/content/com/tamina/planetwars/utils/GameUtil.html

	// Après le départ, jusqu'à nbPlaneteColonise <= (nbPlaneteRestante / 2)
	else if ( otherPlanets != null && otherPlanets.length > 0 && myPlanets.length <= otherPlanets.length )	{
		// Boolean : Vérifie s'il existe encore une planète de size 1
		var planetSize1 = verifPlanetSize(otherPlanets, 1);
		var dejaEnv = false;
		for ( var i = 0; i<myPlanets.length; i++ )
		{
			var myPlanet = myPlanets[ i ];
			// Cible la planète de size 1 la plus proche
			var targetSize1 = getNearPlanetSize(myPlanet, otherPlanets, 1);
			
			// Vérifier s'il existe une flotte vers une planete de size 1
			var verifDejaFlotte = false;
			for ( var j = 0; j<context.fleet.length; j++ )
			{
				var test = context.fleet[j]["target"] ;
				if (test.id == targetSize1.id){
					verifDejaFlotte = true ;
				}
			}
			// Viser la même planete
			if ( i == 0 ) {
				var target = getNearestPlanet(myPlanet,otherPlanets);
			}
			
			// Calcul le nombre de planete de size 1 dans la galaxie
			var nbPlanetSize1 = getNbPlaneteSize(context, 1);

			// Calcul le nombre de mes planetes de size 1 
			var nbMyPlanetSize1 = getNbMyPlaneteSize(context, 1);

			// S'il existe encore une planète de size 1
			if ( planetSize1 == true && nbMyPlanetSize1 < nbPlanetSize1 / 2 )  {	
				// Envoie de la flotte s'il en existe pas une
				if(myPlanet.population >=51 && verifDejaFlotte == false && dejaEnv == false){
					result.push( new Order( myPlanet.id, targetSize1.id, 51 ) );
					dejaEnv = true;
				} else if(myPlanet.size == 1 && myPlanet.population >=50 ){
						result.push( new Order( myPlanet.id, target.id, 10 ) );
				}
			} else if(target.id != 1) {
				if(myPlanet.population >=20 && myPlanet.population <= 50){
					result.push( new Order( myPlanet.id, target.id, myPlanet.population ) );
				} 
				else if(myPlanet.population >=50){
					result.push( new Order( myPlanet.id, target.id, 20 ) );
				}
			}
		}
	} 

	// Quand il reste qu'une planète ennemi.
	else if ( otherPlanets != null && otherPlanets.length > 0 && otherPlanets.length == 1 ){
		for ( var i = 0; i<myPlanets.length; i++ )
		{
			var myPlanet = myPlanets[ i ];
			var target = getNearestPlanet(myPlanet,otherPlanets) ;

			// Cibler mes planètes de size 4 la plus proche
			var myPlanetTarget = getNearPlanetSize(myPlanet, myPlanets, 4);		
			
			// Ciblez la dernière planete
			if(myPlanet.population >=300 && myPlanet.size == 4){
				result.push( new Order( myPlanet.id, target.id, 150 ) );
			} else if(i == 0 && myPlanet.population >=180) {
				result.push( new Order( myPlanet.id, target.id, 40 ) );
			
			// Renforcer mes autres planètes
			} else if(myPlanet.population >=180 && myPlanet.size == 3) {
				result.push( new Order( myPlanet.id, myPlanetTarget.id, 10 ) );
			} else if(myPlanet.population >=100 && myPlanet.size == 2) {
				result.push( new Order( myPlanet.id, myPlanetTarget.id, 10 ) );
			} else if(myPlanet.population >=50 && myPlanet.size == 1) {
				result.push( new Order( myPlanet.id, myPlanetTarget.id, 10 ) );
			}
		}
	}

	// Quand nbPlaneteColonise > nbPlaneteRestante
	else if ( otherPlanets != null && otherPlanets.length > 0 && myPlanets.length > otherPlanets.length ){
		for ( var i = 0; i<myPlanets.length; i++ )
		{
			var myPlanet = myPlanets[ i ];
			var target = getNearestPlanet(myPlanet,otherPlanets) ;			
			if(myPlanet.population >=100 && myPlanet.size == 4){
				result.push( new Order( myPlanet.id, target.id, 40 ) );
			} else if(myPlanet.population >=90 && myPlanet.size == 3) {
				result.push( new Order( myPlanet.id, target.id, 40 ) );
			} else if(myPlanet.population >=80 && myPlanet.size == 2) {
				result.push( new Order( myPlanet.id, target.id, 40 ) );
			} else if(myPlanet.population >=50 && myPlanet.size == 1) {
				result.push( new Order( myPlanet.id, target.id, 10 ) );
			}
		}		
	}
	return result;
};

var getNearestPlanet = function( source, candidats )
	{
		var result = candidats[ 0 ];
		var currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) );
		for ( var i = 0; i<candidats.length; i++ )
		{
			var element = candidats[ i ];
			if ( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) ) )
			{
				currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
				result = element;
			}
			
		}
		return result;
	}

var getNearest2emePlanet = function( source, candidats )
	{
		var result = candidats[ 0 ];
		var temp = candidats[ 0 ] ;
		var currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) );
		for ( var i = 0; i<candidats.length; i++ )
		{
			var element = candidats[ i ];
			if ( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) ) )
			{
				currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
				result = temp;
				temp = element;
			}
			
		}
		return result;
	}

var verifPlanetSize = function(candidats, size)
	{
		for ( var i = 0; i<candidats.length; i++ )
		{
			var element = candidats[ i ];
			if ( element.size == size )
			{
				return true;
			}
			
		}
		return false;
	}

// Condition : verifPlanetSize == True
var getNearPlanetSize = function(source, candidats, size)
	{
		var result = candidats[ 0 ];
		var currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) );
		for ( var i = 0; i<candidats.length; i++ )
		{
			var element = candidats[ i ];
			if ( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) ) 
				&& element.size == size )
			{
				currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
				result = element;
			}
			
		}
		return result;
	}

var getNbPlaneteSize = function(context, size)
{
	var nbPlanetSize = 0 ;
	for ( var i = 0; i<context.content.length; i++ )
	{
		var bob = context.content[i]["size"] ;
		if (bob == size){
			nbPlanetSize++ ;
		}
	}
	return nbPlanetSize;
}

var getNbMyPlaneteSize = function(context, size)
{
	var myPlanets = GameUtil.getPlayerPlanets( id, context );
	var nbMyPlanetSize = 0 ;
	for ( var i = 0; i<myPlanets.length; i++ )
	{
		var yolo = myPlanets[ i ];
		if (yolo.size == size){
			nbMyPlanetSize++ ;
		}
	}
	return nbMyPlanetSize;
}

/**
 * @model Galaxy
 * @param width:Number largeur de la galaxy
 * @param height:Number hauteur de la galaxy
*/
var Galaxy = function(width,height) {
	// largeur
	this.width = width;
	// hauteur
	this.height = height;
	// contenu : liste Planet
	this.content = new Array();
	// flote : liste de Ship
	this.fleet = new Array();
};

/**
 * @model Range
 * @param from:Number début de l'intervale
 * @param to:Number fin de l'intervale
*/
var Range = function(from,to) {
	if(to == null) to = 1;
	if(from == null) from = 0;
	// début de l'intervale
	this.from = from;
	// fin de l'intervale
	this.to = to;
};

/**
 * @model Order
 * @param sourceID:Number id de la planete d'origine
 * @param targetID:Number id de la planete cible
 * @param numUnits:Number nombre d'unité à déplacer
*/
var Order = function(sourceID,targetID,numUnits) {
	// id de la planete d'origine
	this.sourceID = sourceID;
	// id de la planete cible
	this.targetID = targetID;
	// nombre d'unité à déplacer
	this.numUnits = numUnits;
};

/**
 * @model Planet
 * @param x:Number position en x
 * @param y:Number position en y
 * @param size:Number taille
 * @param owner:Player proprietaire
*/
var Planet = function(x,y,size,owner) {
	if(size == null) size = 2;
	if(y == null) y = 0;
	if(x == null) x = 0;
	// position en x
	this.x = x;
	// position en y
	this.y = y;
	// taille
	this.size = size;
	// proprietaire
	this.owner = owner;
	// population
	this.population = PlanetPopulation.getDefaultPopulation(size);
	// id
	this.id = UID.get();
};

/**
 * @model Ship
 * @param crew:Number equipage
 * @param source:Planet origine
 * @param target:Planet cible
 * @param creationTurn:Number numero du tour de creation du vaisseau
*/
var Ship = function(crew,source,target,creationTurn) {
	// equipage
	this.crew = crew;
	// planete d'origine
	this.source = source;
	// planete de destination
	this.target = target;
	// proprietaire du vaisseau
	this.owner = source.owner;
	// numero du tour de creation
	this.creationTurn = creationTurn;
	// duree du voyage en nombre de tour
	this.travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / Game.SHIP_SPEED);
};

/**
 * @internal model
*/
var TurnMessage = function(playerId,galaxy) {
	this.playerId = playerId;
	this.galaxy = galaxy;
};

/**
 * @internal model
*/
var TurnResult = function(orders,message) {
	if(message == null) message = "";
	this.orders = orders;
	this.consoleMessage = message;
	this.error = "";
};

/**
 * @model Point
 * @param x:Number
 * @param y:Number
*/
var Point = function(x,y) {
	this.x = x;
	this.y = y;
};

/**
 * Classe utilitaire
*/
var GameUtil = {} ;
/**
 * @param p1:Point
 * @param p2:Point
 * @return result:Number la distance entre deux points
*/
GameUtil.getDistanceBetween = function(p1,p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}
/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes appartenants à un joueur en particulier
*/
GameUtil.getPlayerPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id == planetOwnerId) result.push(p);
	}
	return result;
}

/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes ennemies et neutres
*/
GameUtil.getEnnemyPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id != planetOwnerId) result.push(p);
	}
	return result;
}

/**
 * Classe utilitaire
 * @internal
*/
var UID = {};
UID.lastUID = 0;
UID.get = function()
{
	UID.lastUID++;
	return UID.lastUID;
}

/**
 * Constantes
*/
var Game = {};
Game.DEFAULT_PLAYER_POPULATION = 100;
Game.NUM_PLANET = new Range(5,10);
Game.PLANET_GROWTH = 5;
Game.SHIP_SPEED = 60;
Game.GAME_SPEED = 500;
Game.GAME_DURATION = 240;
Game.GAME_MAX_NUM_TURN = 500;

var PlanetPopulation = {};
PlanetPopulation.DEFAULT_SMALL = 20;
PlanetPopulation.DEFAULT_NORMAL = 30;
PlanetPopulation.DEFAULT_BIG = 40;
PlanetPopulation.DEFAULT_HUGE = 50;
PlanetPopulation.MAX_SMALL = 50;
PlanetPopulation.MAX_NORMAL = 100;
PlanetPopulation.MAX_BIG = 200;
PlanetPopulation.MAX_HUGE = 300;
PlanetPopulation.getMaxPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
		case PlanetSize.SMALL:
			result = PlanetPopulation.MAX_SMALL;
			break;
		case PlanetSize.NORMAL:
			result = PlanetPopulation.MAX_NORMAL;
			break;
		case PlanetSize.BIG:
			result = PlanetPopulation.MAX_BIG;
			break;
		case PlanetSize.HUGE:
			result = PlanetPopulation.MAX_HUGE;
			break;
		}
	return result;
}
PlanetPopulation.getDefaultPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
		case PlanetSize.SMALL:
			result = PlanetPopulation.DEFAULT_SMALL;
			break;
		case PlanetSize.NORMAL:
			result = PlanetPopulation.DEFAULT_NORMAL;
			break;
		case PlanetSize.BIG:
			result = PlanetPopulation.DEFAULT_BIG;
			break;
		case PlanetSize.HUGE:
			result = PlanetPopulation.DEFAULT_HUGE;
			break;
	}
	return result;
}


var PlanetSize = {};
PlanetSize.SMALL = 1;
PlanetSize.NORMAL = 2;
PlanetSize.BIG = 3;
PlanetSize.HUGE = 4;

