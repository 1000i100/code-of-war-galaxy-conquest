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
var debugMessage = "";

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
var nb = 0;
var currentTarget;
var nbTotalSends = 0;
var isPlanetToFed = new Array();
var getOrders = function(context) {

	debugMessage = "Vince msg : " +nb+ "<BR>";
	if (nb == 0) {
		var allPlanets = GameUtil.getEnnemyPlanets( 100, context );
		debugMessage += "allPlanets OK <BR>";
		for ( var i = 0; i<allPlanets.length; i++ ) {
			//debugMessage += "---" + allPlanets[i].id + "<BR>";
			var pp = {};
			pp.id = allPlanets[i].id;
			pp.tofeed = true;
			isPlanetToFed.push(pp);
		}
	}

	var result = new Array();
	var myPlanets = GameUtil.getPlayerPlanets( id, context );
	debugMessage += "myPlanets OK <BR>";
	var ennemyPlanets = GameUtil.getPlayerPlanets( 2, context );
	debugMessage += "ennemyPlanets OK <BR>";
	var neutralPlanets = GameUtil.getPlayerPlanets( 5, context );
	debugMessage += "neutralPlanets OK <BR>";
	var otherPlanets = GameUtil.getEnnemyPlanets(id, context);
	debugMessage += "otherPlanets OK <BR>";
	var feedmePlanets = new Array();
	for ( var i = 0; i<myPlanets.length; i++ ) {
		var p = myPlanets[i];
		var prct;
		switch(p.size) {
		case 1:
			prct = 0.5;
			break;
		case 2:
			prct = 0.65;
			break;
		case 3:
			prct = 0.8;
			break;
		case 4:
			prct = 0.9;
			break;
		}
		if (p.population < (PlanetPopulation.getMaxPopulation(p.size)*prct)) {
			for ( var j = 0; j<isPlanetToFed.length; j++ ) {
				//debugMessage += "---" + isPlanetToFed[j].id + "<BR>"
				if (p.id == isPlanetToFed[j].id && isPlanetToFed[j].tofeed) {
					feedmePlanets.push(p);
				}
			}
			
		}
	}
	debugMessage += "feedmePlanets OK <BR>";
	
	var target;
	if (otherPlanets.length > 0) {
		debugMessage += getMyPopulation(myPlanets) + " > " + (getMyMaxPopulation(myPlanets)*0.99) + "<BR>";
		if (nb == 0 || (myPlanets.length < 6 && neutralPlanets.length > ennemyPlanets.length )) {
			//target = getTargetPlanet(myPlanets[myPlanets.length-1],otherPlanets, getMyPopulation(myPlanets)).id;
			target = getNearestPlanet(myPlanets[myPlanets.length-1],neutralPlanets);
		} else {
			if (ennemyPlanets.length > 1) {
				//target = (ennemyPlanets[0]).id;
				target = getNearestPlanet(myPlanets[myPlanets.length-1],ennemyPlanets);
				/*if (otherPlanets[0].population > getMyPopulation(myPlanets)) {
					target = (otherPlanets[1]).id;
				}*/
			} else if (neutralPlanets.length>0){
				target = (neutralPlanets[0]);
			}
		}
		//target = getNearestPlanet(myPlanets[myPlanets.length-1],otherPlanets).id;
		if (otherPlanets.length > 1 ) {
			if ( otherPlanets != null && otherPlanets.length > 0)
			{

				
				if (ennemyPlanets.length == 1 && myPlanets.length > 4) {
					//nbTotalSends = 0;

					for ( var i = 0; i<myPlanets.length; i++ )
					{
						var myPlanet = myPlanets[ i ];
						if (myPlanet == getNearestPlanet(ennemyPlanets[0], myPlanets)) {
							result.push( new Order( myPlanet.id, (ennemyPlanets[0]).id, 5) );
						} else {
							//var nbSends = Math.round(myPlanet.population/(myPlanets.length));
							//var nbSends = Math.round(myPlanet.population*0.4);
							var nbSends = 5;
							nbTotalSends = nbTotalSends + 5;
							//(PlanetPopulation.getMaxPopulation(destPlanet.size)-destPlanet.population)
							if (nbTotalSends >= target.population) {
								if (neutralPlanets.length>1){
									target = (neutralPlanets[1]);
								} else {
									if (feedmePlanets.length > 0) {
										target = feedmePlanets[0];
									} else {
										target = ennemyPlanets[0];
									}
								}
							}
							//result.push( new Order( myPlanet.id, target, Math.round(myPlanet.population/myPlanets.length)) );
							result.push( new Order( myPlanet.id, target.id, nbSends) );
						}
					}
					//result.push( new Order( (myPlanets[0]).id, (ennemyPlanets[0]).id, 5) );
				} else {
					for ( var i = 0; i<myPlanets.length; i++ )
					{
						var myPlanet = myPlanets[ i ];
						//var nbSends = Math.round(myPlanet.population/myPlanets.length);
						if (target.owner.id == 5) {
							var nbSends = myPlanet.population;

						} else {
							var nbSends = Math.round(myPlanet.population*0.7);
						}
						if (nbSends > (PlanetPopulation.getMaxPopulation(target.size) + target.population)) {
							nbSends = (PlanetPopulation.getMaxPopulation(target.size) + target.population);
						}
						//result.push( new Order( myPlanet.id, target, Math.round(myPlanet.population/myPlanets.length)) );
						result.push( new Order( myPlanet.id, target.id, nbSends) );
					}
				}
			}
		} 
		/*else if (getMyPopulation(myPlanets) > (getMyMaxPopulation(myPlanets)*0.90)) {
			/*var nb = otherPlanets[0].population;
			var mp = getNearestPlanet(ennemyPlanets[0], myPlanets);
			if (mp.population > nb) {
				result.push( new Order( mp.id, (ennemyPlanets[0]).id, nb) );
			}
			debugMessage += "c'est plein<BR>";
			for ( var i = 0; i<myPlanets.length; i++ )
			{
				result.push( new Order( (myPlanets[i]).id, (ennemyPlanets[0]).id, 5) );
			}
			
		} */ else {
			debugMessage += "c'est pas plein<BR>";
			//nbTotalSends = 0;
			var feeding = false;
			if (feedmePlanets.length > 0) {
				var dd = Math.floor(Math.random()*feedmePlanets.length);
				//tofeed = feedmePlanets[dd].id;
				target = feedmePlanets[0];
			} else {
				//tofeed = null;
				if (ennemyPlanets.length > 0) {
					target = ennemyPlanets[0];
				} else {
					target = (myPlanets[0]);
				}
			}
			for ( var i = 0; i<myPlanets.length; i++ )
			{
				var myPlanet = myPlanets[ i ];
				if (myPlanet == getNearestPlanet(ennemyPlanets[0], myPlanets)) {
					result.push( new Order( myPlanet.id, (ennemyPlanets[0]).id, 5) );
				} else {
					if (myPlanet.population >= PlanetPopulation.getMaxPopulation(myPlanet.size)) {
						//var destPlanet = (ennemyPlanets[0]).id;
						if (ennemyPlanets.length > 0) {
							target = (ennemyPlanets[0]);
						} else {
							target = (myPlanets[0]);
						}
						/*if (feedmePlanets.length > 0) {
							feeding = true;
							var dd = Math.floor(Math.random()*feedmePlanets.length);
							destPlanet = feedmePlanets[dd].id;
						}*/
						if (feedmePlanets.length > 0) {
							feeding = true;
							//var dd = Math.floor(Math.random()*feedmePlanets.length);
							target = feedmePlanets[0];
						}
						/*if (tofeed != null) {
							feeding = true;
							destPlanet = tofeed;
						}*/
						//if (feeding) {
							nbTotalSends = nbTotalSends+5;
							//if (nbTotalSends>(PlanetPopulation.getMaxPopulation(destPlanet.size)-destPlanet.population)) {
							var nn = (PlanetPopulation.getMaxPopulation(target.size)-target.population)
							debugMessage += "Combien envoyés : " + i + "/" + myPlanets.length + ":" +nbTotalSends + " === " + nn + "<BR>";
							if (nbTotalSends>(PlanetPopulation.getMaxPopulation(target.size)-target.population)) {
								for ( var j = 0; j<isPlanetToFed.length; j++ ) {
									//debugMessage += "---" + isPlanetToFed[j].id + "<BR>"
									if (target.id == isPlanetToFed[j].id) {
										isPlanetToFed[j].tofeed = false;
									}
								}
								if (feedmePlanets.length > 1) {
									debugMessage += "change before it was cool<BR>";
									//var dd = Math.floor(Math.random()*feedmePlanets.length);
									//destPlanet = feedmePlanets[dd].id;
									target = feedmePlanets[1];
								} else {
									//destPlanet = (ennemyPlanets[0]).id;
									if (ennemyPlanets.length > 0) {
										target = (ennemyPlanets[0]);
									} else {
										target = (myPlanets[0]);
									}
								}
							}
						//}
						/*for ( var j = 0; j<feedmePlanets.length; j++ )
						{

						}*/
						/*for ( var j = 0; j<myPlanets.length-i; j++ )
						{
							var tempPlanet = myPlanets[ j ];
							var prct = 1 - ((5-tempPlanet.size)/10);
							if (tempPlanet.population < ( PlanetPopulation.getMaxPopulation(tempPlanet.size) * prct)) {
								destPlanet = tempPlanet.id;
							}
							
						}*/
						//result.push( new Order( myPlanet.id, destPlanet, 5) );
						debugMessage += myPlanet.id + " to " + target.id + "<BR>";
						result.push( new Order( myPlanet.id, target.id, 5) );
					}
				}
				
			}
			//result.push( new Order( (myPlanets[0]).id, (ennemyPlanets[0]).id, 5) );
		}
	}
	if (target.id != currentTarget) {
		debugMessage += "changeTarget" + target;

		currentTarget = target.id;
		nbTotalSends = 0;
	}
	nb ++;
	return result;
};

var getMyPopulation = function (planets)
	{
		var result = 0;
		for ( var i = 0; i<planets.length; i++ )
		{
			var myPlanet = planets[ i ];
			result += myPlanet.population;
		}
		return result;
	}

var getMyMaxPopulation = function (planets)
	{
		var result = 0;
		for ( var i = 0; i<planets.length; i++ )
		{
			var myPlanet = planets[ i ];
			result += PlanetPopulation.getMaxPopulation(myPlanet.size);
		}
		return result;
	}

var getTargetPlanet = function ( source, candidats, pop )
	{
		var result = candidats[ 0 ];
		var currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) );
		for ( var i = 0; i<candidats.length; i++ )
		{
			var element = candidats[ i ];
			if (element.population < pop) {
				if ( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) ) )
				{
					currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
					result = element;
				}
			}
			
		}
		return result;
	}

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

