/*
 * ! PlanetWars Javascript Basic IA exemple
 * http://www.tamina-online.com/expantionreloded/
 * 
 * 
 * Copyright 2013 Tamina Released under the MIT license
 * http://opensource.org/licenses/MIT
 * 
 * author : david mouton
 */

// / variables globales
// nom de l'IA
var name = "Le gruick fantastique";

// couleur d'affichage
var color = 0;

// message de debugage utilisé par le systeme et affiché dans la trace à chaque
// tour du combat
var debugMessage = "";

// Id de l'IA
var id = 0;

// Nombre de tours
var turns = 0;

var minPop = 0;
var deltaPop = 10;

// id du neutre
var neutralId = 5;

/**
 * Planète ciblée
 */
function TargetedPlanet(id, turn) {
	this.id = id;
	this.turn = turn;
}

/**
 * Planètes ciblées
 */
function TargetedPlanets() {
	this.planets = new Array();
}

/**
 * Purge des planètes ciblées
 */
TargetedPlanets.prototype.purge = function(turns) {
	var tp = new Array();
	for (var i = 0; i < this.planets.length; i++) {
		if (this.planets[i].turn >= turns) {
			tp.push(this.planets[i]);
		}
	}
	this.planets = tp;
};

/**
 * Detarget d'une planete
 */
TargetedPlanets.prototype.detarget = function(planetId) {
	var tp = new Array();
	for (var i = 0; i < this.planets.length; i++) {
		if (this.planets[i].id != planetId) {
			tp.push(this.planets[i]);
		}
	}
	this.planets = tp;
};

/**
 * Vérifie si la planète est déjà ciblée
 */
TargetedPlanets.prototype.isAlreadyTargeted = function(id) {
	for (var i = 0; i < this.planets.length; i++) {
		if (this.planets[i].id == id)
			return true;
	}
	return false;
};

var targetedPlanets = new TargetedPlanets();

// optim
var optimizeScore = true;
var ignoredEnemyPlanets = 0;
if (optimizeScore)
	ignoredEnemyPlanets = 1;
var myLastPop = 0;

/**
 * Les ordres
 */
var getOrders = function(context) {
	debugMessage = "";
	turns++;
	targetedPlanets.purge(turns);
	// var multiAttackPlanets = new Array();
	var result = new Array();
	var myPlanets = GameUtil.getPlayerPlanets(id, context);
	var ennemyPlanets = GameUtil.getEnnemyPlanets(id, context);
	var neutralPlanets = GameUtil.getNeutralPlanets(id, context);

	// mono
	for (var i = myPlanets.length - 1; i >= 0; i--) {
		var myPlanet = myPlanets[i];
		// une planete se detarget
		targetedPlanets.detarget(myPlanet.id);

		// opt
		if (optimizeScore && turns == 1 && i == myPlanets.length - 1) {
			// planete enemie
			var toPlanet = ennemyPlanets[0];
			var pts = myPlanet.population;
			targetedPlanets.planets.push(new TargetedPlanet(toPlanet.id, turns
							+ getNbTurns(myPlanet, toPlanet)));
			result.push(new Order(myPlanet.id, toPlanet.id, pts));
			// neutre la plus éloignée
			// toPlanet = getFurthestPlanet(myPlanet, neutralPlanets);
			// pts = myPlanet.population - 46;
			// targetedPlanets.planets.push(new TargetedPlanet(toPlanet.id,
			// turns
			// + getNbTurns(myPlanet, toPlanet)));
			// result.push(new Order(myPlanet.id, toPlanet.id, pts));
		}
		// normal
		else {
			// target ennemi
			var toPlanet = 0; 
			if(ennemyPlanets.length > ignoredEnemyPlanets) toPlanet = getBestPlanet(myPlanet, ennemyPlanets);
			if (toPlanet != 0) {
				var pts = popToSend(myPlanet, toPlanet);
				targetedPlanets.planets.push(new TargetedPlanet(toPlanet.id,
						turns + getNbTurns(myPlanet, toPlanet)));
				result.push(new Order(myPlanet.id, toPlanet.id, pts));
			}
			// neutre
			else {
				var toPlanet = getBestPlanet(myPlanet, neutralPlanets);
				if (toPlanet != 0) {
					var pts = popToSend(myPlanet, toPlanet);
					targetedPlanets.planets
							.push(new TargetedPlanet(toPlanet.id, turns
											+ getNbTurns(myPlanet, toPlanet)));
					result.push(new Order(myPlanet.id, toPlanet.id, pts));
				}
				// full ?
				else if (myPlanet.population == PlanetPopulation
						.getMaxPopulation(myPlanet.size)) {
					var pts = myPlanet.population;
					toPlanet = ennemyPlanets[0];
					targetedPlanets.planets
							.push(new TargetedPlanet(toPlanet.id, turns
											+ getNbTurns(myPlanet, toPlanet)));
					result.push(new Order(myPlanet.id, toPlanet.id, pts));
				}
				// sinon à plusieurs ?
				else {
					// multiAttackPlanets.push(myPlanet.id);
				}
			}
		}
	}

	// multi
	// if(multiAttackPlanets.length > 0) {
	// var toPlanet = getBestMultiPlanet(multiAttackPlanets, ennemyPlanets,
	// targetedPlanets);
	// if(toPlanet != 0) {
	// var pts = popToSend(myPlanet, toPlanet);
	// targetedPlanets.push(new targetedPlanet(toPlanet.id, turns));
	// result.push( new Order( myPlanet.id, toPlanet.id, pts ) );
	// }
	// }

	myLastPop = getTotalPop(myPlanets);
	debugMessage += turns + " : " + getTotalPop(myPlanets) + " : "
			+ Math.round(getFinalScore(myPlanets));
	return result;
};

function getTotalPop(myPlanets) {
	var pop = 0;
	for (var i = 0; i < myPlanets.length; i++) {
		pop += myPlanets[i].population;
	}
	return pop;
}

function getFinalScore(myPlanets) {
	return getTotalPop(myPlanets) * 1000 / turns;
}

// / scores

// dist
var getScoreDist = function(src, dst) {
	return dist(src, dst);
}

// size, dist
var getScoreDistSize = function(src, dst) {
	return dist(src, dst) / dst.size;
}

// size, dist, pop
var getScoreDistSizePop = function(src, dst) {
	return dist(src, dst) * dst.population / dst.size;
}

// size, dist, pop, owner
var getScoreDistSizePopOwner = function(src, dst) {
	var o = 2;
	if (dst.owner.id != neutralId)
		o = 1;
	return o * dist(src, dst) * dst.population / dst.size;
}

// size, dist, pop, pond
var getScoreDistSizePopPond = function(src, dst) {
	return dist(src, dst) * dst.population / dst.size / dst.size;
}

// dist, pop, pond
var getScoreDistPopPond = function(src, dst) {
	return dist(src, dst) * dst.population * dst.population;
}

// size, pop
var getScoreSizePop = function(src, dst) {
	return dst.population / dst.size;
}

// turn, pop, size
var getScoreTurnPopSize = function(src, dst) {
	return getNbTurns(src, dst) * dst.population / dst.size;
}

// score
var getScore = function(src, dst) {
	return getScoreTurnPopSize(src, dst);
}

// / Calculs

// population à envoyer pour coloniser
var popToSend = function(fromPlanet, toPlanet) {
	var fromPop = fromPlanet.population;
	var toPop = toPlanet.population;
	var nbTurns = getNbTurns(fromPlanet, toPlanet);
	var popToSend = Math.min(Game.PLANET_GROWTH * nbTurns + toPop,
			PlanetPopulation.getMaxPopulation(toPlanet.size))
			+ 1;
	if (fromPop < popToSend)
		return 0;
	else
		return popToSend;
}

// population à envoyer pour coloniser à plusieurs
// var popToSendMulti = function(fromPlanets, toPlanet) {
// var toPop = toPlanet.population;
// var alreadySentPop = 0;
// for(var i = 0; i < fromPlanets.length; i++) {
// var fromPop = fromPlanets[i].population;
// var nbTurns = getNbTurns(fromPlanet, toPlanet);
// var popToSend =Math.min(Game.PLANET_GROWTH * nbTurns + toPop,
// PlanetPopulation.getMaxPopulation(toPlanet.size)) + 1 - alreadySentPop;
// if(fromPop < popToSend) alreadySentPop += fromPop;
// else alreadySentPop += popToSend;
// }
// return alreadySentPop;
// }

/**
 * Nombre de tours pour rejoindre une planete
 * 
 * @param {}
 *            source
 * @param {}
 *            candidats
 * @return {} le nombre de tours
 */
function getNbTurns(source, target) {
	return Math.ceil(GameUtil.getDistanceBetween(new Point(source.x, source.y),
			new Point(target.x, target.y))
			/ Game.SHIP_SPEED)
}

/**
 * Distance entre 2 planetes
 * 
 * @param {}
 *            src
 * @param {}
 *            dst
 * @return {} la distance
 */
function dist(src, dst) {
	return GameUtil.getDistanceBetween(new Point(src.x, src.y), new Point(
					dst.x, dst.y));
}

// la moins chere à coloniser
var getBestPlanet = function(source, candidats) {
	var target = 0;
	var popTosend = 0;
	var nbTurns = 0;

	for (var i = 0; i < candidats.length; i++) {
		var element = candidats[i];
		if (!targetedPlanets.isAlreadyTargeted(element.id)) {
			var pts = popToSend(source, element);
			if (pts > 0) {
				if (target == 0 || pts < popTosend) {
					target = element;
					popTosend = pts;
					// debugMessage += source.id + " : " + pts + " = " +
					// target.id + " | ";
				}
			}
		}
	}
	return target;
};

// la plus loin
var getFurthestPlanet = function(source, candidats) {
	var target = 0;
	var nbTurns = 0;

	for (var i = 0; i < candidats.length; i++) {
		var element = candidats[i];
		if (!targetedPlanets.isAlreadyTargeted(element.id)) {
			var n = getNbTurns(source, element);
			if (n > nbTurns) {
				nbTurns = n;
				target = element;
			}
		}
	}
	return target;
};

// la moins chere à coloniser à plusieurs
// var getBestMultiPlanet = function(sources, candidats, targetedPlanets ) {
// var target = 0;
// var popTosend = 0;
// var nbTurns = 0;
//
// for ( var i = 0; i < candidats.length; i++ ) {
// var element = candidats[ i ];
// if ( ! isAlreadyTargeted(targetedPlanets, element.id)) {
// var pts = popToSendMulti(sources, element);
// if(target == 0 || pts < popTosend) {
// target = element;
// popTosend = pts;
// }
// }
// }
// }
// return target;
// }

var getNearestPlanet = function(source, candidats) {
	var result = candidats[0];
	var currentDist = GameUtil.getDistanceBetween(
			new Point(source.x, source.y), new Point(result.x, result.y));
	for (var i = 0; i < candidats.length; i++) {
		var element = candidats[i];
		if (currentDist > GameUtil.getDistanceBetween(new Point(source.x,
						source.y), new Point(element.x, element.y))) {
			currentDist = GameUtil.getDistanceBetween(new Point(source.x,
							source.y), new Point(element.x, element.y));
			result = element;
		}

	}
	return result;
}

/**
 * @internal method
 */
onmessage = function(event) {
	if (event.data != null) {
		var turnMessage = event.data;
		id = turnMessage.playerId;
		postMessage(new TurnResult(getOrders(turnMessage.galaxy), debugMessage));
	} else
		postMessage("data null");
};

/**
 * @model Galaxy
 * @param width:Number
 *            largeur de la galaxy
 * @param height:Number
 *            hauteur de la galaxy
 */
var Galaxy = function(width, height) {
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
 * @param from:Number
 *            début de l'intervale
 * @param to:Number
 *            fin de l'intervale
 */
var Range = function(from, to) {
	if (to == null)
		to = 1;
	if (from == null)
		from = 0;
	// début de l'intervale
	this.from = from;
	// fin de l'intervale
	this.to = to;
};

/**
 * @model Order
 * @param sourceID:Number
 *            id de la planete d'origine
 * @param targetID:Number
 *            id de la planete cible
 * @param numUnits:Number
 *            nombre d'unité à déplacer
 */
var Order = function(sourceID, targetID, numUnits) {
	// id de la planete d'origine
	this.sourceID = sourceID;
	// id de la planete cible
	this.targetID = targetID;
	// nombre d'unité à déplacer
	this.numUnits = numUnits;
};

/**
 * @model Planet
 * @param x:Number
 *            position en x
 * @param y:Number
 *            position en y
 * @param size:Number
 *            taille
 * @param owner:Player
 *            proprietaire
 */
var Planet = function(x, y, size, owner) {
	if (size == null)
		size = 2;
	if (y == null)
		y = 0;
	if (x == null)
		x = 0;
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
 * @param crew:Number
 *            equipage
 * @param source:Planet
 *            origine
 * @param target:Planet
 *            cible
 * @param creationTurn:Number
 *            numero du tour de creation du vaisseau
 */
var Ship = function(crew, source, target, creationTurn) {
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
	this.travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(
					source.x, source.y), new Point(target.x, target.y))
			/ Game.SHIP_SPEED);
};

/**
 * @internal model
 */
var TurnMessage = function(playerId, galaxy) {
	this.playerId = playerId;
	this.galaxy = galaxy;
};

/**
 * @internal model
 */
var TurnResult = function(orders, message) {
	if (message == null)
		message = "";
	this.orders = orders;
	this.consoleMessage = message;
	this.error = "";
};

/**
 * @model Point
 * @param x:Number
 * @param y:Number
 */
var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

/**
 * Classe utilitaire
 */
var GameUtil = {};
/**
 * @param p1:Point
 * @param p2:Point
 * @return result:Number la distance entre deux points
 */
GameUtil.getDistanceBetween = function(p1, p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes appartenants à un joueur
 *         en particulier
 */
GameUtil.getPlayerPlanets = function(planetOwnerId, context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while (_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if (p.owner.id == planetOwnerId)
			result.push(p);
	}
	return result;
}

/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes ennemies
 */
GameUtil.getEnnemyPlanets = function(planetOwnerId, context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while (_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if (p.owner.id != planetOwnerId && p.owner.id != neutralId)
			result.push(p);
	}
	return result;
}

/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes neutres
 */
GameUtil.getNeutralPlanets = function(planetOwnerId, context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while (_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if (p.owner.id == neutralId)
			result.push(p);
	}
	return result;
}

/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes neutres et ennemies
 */
GameUtil.getNeutralAndEnnemyPlanets = function(planetOwnerId, context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while (_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if (p.owner.id != planetOwnerId)
			result.push(p);
	}
	return result;
}

/**
 * Classe utilitaire
 * 
 * @internal
 */
var UID = {};
UID.lastUID = 0;
UID.get = function() {
	UID.lastUID++;
	return UID.lastUID;
}

/**
 * Constantes
 */
var Game = {};
Game.DEFAULT_PLAYER_POPULATION = 100;
Game.NUM_PLANET = new Range(5, 10);
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
	switch (planetSize) {
		case PlanetSize.SMALL :
			result = PlanetPopulation.MAX_SMALL;
			break;
		case PlanetSize.NORMAL :
			result = PlanetPopulation.MAX_NORMAL;
			break;
		case PlanetSize.BIG :
			result = PlanetPopulation.MAX_BIG;
			break;
		case PlanetSize.HUGE :
			result = PlanetPopulation.MAX_HUGE;
			break;
	}
	return result;
}
PlanetPopulation.getDefaultPopulation = function(planetSize) {
	var result = 1;
	switch (planetSize) {
		case PlanetSize.SMALL :
			result = PlanetPopulation.DEFAULT_SMALL;
			break;
		case PlanetSize.NORMAL :
			result = PlanetPopulation.DEFAULT_NORMAL;
			break;
		case PlanetSize.BIG :
			result = PlanetPopulation.DEFAULT_BIG;
			break;
		case PlanetSize.HUGE :
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
