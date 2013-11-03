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
var name = "MLE_IA_JS";

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
var turnNumber = -1;
var planetsPop = {};
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
    var start = new Date().getTime();
    turnNumber = turnNumber + 1;
    //debugMessage = '<br/>' + 'Beginning turn ' + turnNumber + '<br/>';
    setPops(context);
	var result = new Array();
	var myPlanets = GameUtil.getPlayerPlanets( id, context );
	var otherPlanets = GameUtil.getEnnemyPlanets(id, context);
    var enemyShips = GameUtil.getEnnemyShips(id, context);
    var myShips = GameUtil.getPlayerShips(id, context);

    //attaquer dès son premier mouv !
    /*if (turnNumber == 0) {
        return result;
    }
    if (turnNumber <= 2 && enemyShips != null && enemyShips.length > 0 ) {
        //debugMessage += 'Sending ship with ' + myPlanets[0].population + ' to ' + enemyShips[0].source.id + ' nb turn travel=' + Math.ceil(GameUtil.getDistanceBetween(new Point(myPlanets[0].x,myPlanets[0].y),new Point(enemyShips[0].source.x,enemyShips[0].source.y)) / Game.SHIP_SPEED) + '<br/>';
        result.push( new Order( myPlanets[0].id, enemyShips[0].source.id, myPlanets[0].population));
        modifyPop(myPlanets[0].id, -myPlanets[0].population);
        return result;
    } else if(turnNumber <= 2) {
        return result;
    }*/

    try {
    //attaquer juste après colonisation ennemie
    if ( enemyShips != null && enemyShips.length > 0 ) {
        for ( var i = 0; i<enemyShips.length; i++ ) {
            if(enemyShips[i].target) {
                //debugMessage += 'Enemy ship from ' + enemyShips[i].source.id + ' to ' + enemyShips[i].target.id + ' with ' + enemyShips[i].crew + '<br/>';
                var ETA = enemyShips[i].creationTurn + enemyShips[i].travelDuration;
                var nbTurnsToArrive = ETA - turnNumber;
                var popAtImpact = planetsPop[enemyShips[i].target.id] + (Game.PLANET_GROWTH * nbTurnsToArrive);
                //debugMessage += 'popAtImpact ' + popAtImpact + '<br/>';
                if(enemyShips[i].crew >= popAtImpact) {
                    //debugMessage += 'Enemy winning' + '<br/>';
                    var defended = false;
                    var myPlanetsTemp = newArray(myPlanets);
                    removePlanetFrom(enemyShips[i].target, myPlanetsTemp);
                    var security = 0;
                    while(!defended && myPlanetsTemp.length > 0 && security < 20) {
                        security++;
                        var candidatePlanet = getNearestPlanet(enemyShips[i].target, myPlanetsTemp);
                        if(candidatePlanet) {
                            if(turnNumber + getNbTurnToGoTo(enemyShips[i].target, candidatePlanet) > ETA && turnNumber + getNbTurnToGoTo(enemyShips[i].target, candidatePlanet) < (ETA + 10)) {
                                if(planetsPop[candidatePlanet.id] > (enemyShips[i].crew - popAtImpact + (Game.PLANET_GROWTH * (turnNumber + getNbTurnToGoTo(enemyShips[i].target, candidatePlanet) - ETA)))) {
                                    //debugMessage += candidatePlanet.id + ' has enough pop : ' + planetsPop[candidatePlanet.id] + ' for enemy ' + (enemyShips[i].crew - popAtImpact) + '<br/>';
                                    result.push( new Order( candidatePlanet.id, enemyShips[i].target.id, enemyShips[i].crew - popAtImpact + 1));
                                    modifyPop(candidatePlanet.id, -(enemyShips[i].crew - popAtImpact + 1));
                                    modifyPop(enemyShips[i].target.id, -(enemyShips[i].crew - popAtImpact + 1));
                                    defended = true;
                                } else {
                                    //debugMessage += candidatePlanet.id + ' has not enough pop : ' + planetsPop[candidatePlanet.id] + ' for enemy ' + (enemyShips[i].crew - popAtImpact + (Game.PLANET_GROWTH * (turnNumber + getNbTurnToGoTo(enemyShips[i].target, candidatePlanet) - ETA))) + '<br/>';
                                    removePlanetFrom(candidatePlanet, myPlanetsTemp);
                                }
                            } else {
                                //debugMessage += candidatePlanet.id + ' too far away : ' + (turnNumber + getNbTurnToGoTo(enemyShips[i].target, candidatePlanet)) +  '<br/>';
                                removePlanetFrom(candidatePlanet, myPlanetsTemp);
                            }
                        } else {
                            //debugMessage += 'candidatePlanet null' +  '<br/>';
                            defended = true;
                        }
                    }
                }
            }
        }
    }
    } catch(e) {
        //debugMessage += 'Erreur enemyShips : ' + e + '<br/>';
    }
    //debugMessage += '; Phase 1 en ' + (new Date().getTime() - start) + 'ms' + '<br/>';
    start = new Date().getTime();

    try {
        //attacker petites planètes proches
        var neutralPlanets = otherPlanets; //GameUtil.getPlayerPlanets(5, context);
        //debugMessage += 'neutralPlanets ' + neutralPlanets.length + '<br/>';
        if ( neutralPlanets != null && neutralPlanets.length > 0 ) {
            var notPossible = false;
            var security = 0;
            while(!notPossible && security < 10) {
                security++;
                var attackNeutral = new Array();
                for ( var i = 0; i<neutralPlanets.length; i++ ) {
                    for ( var j = 0; j<myPlanets.length; j++ ) {
                        var nbTurns = Math.ceil(GameUtil.getDistanceBetween(new Point(neutralPlanets[i].x,neutralPlanets[i].y),new Point(myPlanets[j].x,myPlanets[j].y)) / Game.SHIP_SPEED);
                        var popToKill = getPopPlanetAtArriving(myPlanets[j], neutralPlanets[i]);
                        var cost = nbTurns*5 + popToKill;
                        //debugMessage += 'Sending ' + myPlanets[j].id + ' to ' + neutralPlanets[i].id + '('+neutralPlanets[i].population+') costs ' + cost + ' for ' + nbTurns + 'turns and ' + popToKill + '<br/>';
                        insertCost(attackNeutral, myPlanets[j].id, neutralPlanets[i].id, cost);
                    }
                }
                var minCost = 10000;
                var minIndex = 0;
                var minI = 0;
                for(var i= 0;i<neutralPlanets.length;i++) {
                    var sourceList = attackNeutral[neutralPlanets[i].id];
                    //debugMessage += 'Sorting ' + neutralPlanets[i].id + '<br/>';
                    if(sourceList) {
                        for(var j= 0;j<myPlanets.length;j++) {
                            if(sourceList[myPlanets[j].id]) {
                                var cost = sourceList[myPlanets[j].id];
                                //debugMessage += 'Cost ' + cost + ' for ' + myPlanets[j].id + '<br/>';
                                if(cost < minCost) {
                                    minCost = cost;
                                    minIndex = j;
                                    minI = i;
                                }
                            }
                        }
                    }
                }
                //debugMessage += 'Min cost= ' + minCost + ' from ' + myPlanets[minIndex].id + ' to ' + neutralPlanets[minI].id + '<br/>';
                var popToKill = getPopPlanetAtArriving(myPlanets[minIndex], neutralPlanets[minI]);
                //debugMessage += 'Actualized pop ' + myPlanets[minIndex].id + ' = ' + planetsPop[myPlanets[minIndex].id] + '<br/>';
                if(planetsPop[myPlanets[minIndex].id] > popToKill) {
                    result.push( new Order( myPlanets[minIndex].id, neutralPlanets[minI].id, popToKill + 1));
                    //debugMessage += 'Sending  ' + (popToKill + 1) + ' from ' + myPlanets[minIndex].id + ' to ' + neutralPlanets[minI].id + '<br/>';
                    modifyPop(neutralPlanets[minI].id, -popToKill - 1);
                    modifyPop(myPlanets[minIndex].id, -popToKill - 1);
                } else {
                    var popTotal = 0;
                    for(var j= 0;j<myPlanets.length;j++) {
                        popTotal += planetsPop[myPlanets[j].id];
                    }
                    //debugMessage += 'Total pop disp ' + popTotal + '<br/>';
                    if(popTotal > popToKill) {
                        var currentPopSend = 0;
                        var ind = 0;
                        while(currentPopSend <= popToKill && ind < myPlanets.length) {
                            if(planetsPop[myPlanets[ind].id] <= (popToKill - currentPopSend)) {
                                result.push( new Order( myPlanets[ind].id, neutralPlanets[minI].id, planetsPop[myPlanets[ind].id]));
                                //debugMessage += 'Sending partial ' + planetsPop[myPlanets[ind].id] + ' from ' + myPlanets[ind].id + ' to ' + neutralPlanets[minI].id + '<br/>';
                                modifyPop(neutralPlanets[minI].id, -planetsPop[myPlanets[ind].id]);
                                modifyPop(myPlanets[ind].id, -planetsPop[myPlanets[ind].id]);
                                currentPopSend += planetsPop[myPlanets[ind].id];
                            } else {
                                result.push( new Order( myPlanets[ind].id, neutralPlanets[minI].id, popToKill - currentPopSend + 1));
                                //debugMessage += 'Sending partial 2 ' + (popToKill - currentPopSend + 1) + ' from ' + myPlanets[ind].id + ' to ' + neutralPlanets[minI].id + '<br/>';
                                modifyPop(neutralPlanets[minI].id, -(popToKill - currentPopSend + 1));
                                modifyPop(myPlanets[ind].id, -(popToKill - currentPopSend + 1));
                                currentPopSend = popToKill + 1;
                            }
                            ind++;
                        }
                    } else {
                        notPossible = true;
                    }
                }
            }
        }
    } catch(e) {
        //debugMessage += 'Erreur otherPlanets : ' + e + '<br/>';
    }
    //debugMessage += '; Phase 2 en ' + (new Date().getTime() - start) + 'ms' + '<br/>';
    start = new Date().getTime();

    try {
    //send to other planets
    for ( var i = 0; i<myPlanets.length; i++ ) {
        var myPlanet = myPlanets[i];
        if(planetsPop[myPlanet.id] == (PlanetPopulation.getMaxPopulation(myPlanet.size) - 5)) {
            //debugMessage += myPlanet.id + ' has reached max pop ' + planetsPop[myPlanet.id] + '<br/>';
            var myPlanetsTemp = newArray(myPlanets);
            var found = false;
            while(!found && myPlanetsTemp.length > 0) {
                var nearest = getNearestPlanet(myPlanet, myPlanetsTemp);
                if(nearest && validatePopNotMaxAtArriving(myPlanet, nearest, 5)) {
                    result.push( new Order( myPlanet.id, nearest.id, 5 ) );
                    //debugMessage += 'Sending 5 to repop' + nearest.id + '<br/>';
                    modifyPop(myPlanets[i].id, -5);
                    found = true;
                }
                if(nearest) {
                     removePlanetFrom(nearest, myPlanetsTemp);
                } else {
                    found = true;
                }
            }
            if(!found) {
                //attack nearest enemy
                var nearest = getNearestPlanet(myPlanet, otherPlanets);
                if(nearest && planetsPop[myPlanet.id] >= 10) {
                    result.push( new Order( myPlanet.id, nearest.id, 10 ) );
                    //debugMessage += 'Not found to repop, sending 10 to ' + nearest.id + '<br/>';
                }
            }
        }
    }
    } catch(e) {
        //debugMessage += 'Erreur myPlanets : ' + e + '<br/>';
    }
    //debugMessage += '; Phase 3 en ' + (new Date().getTime() - start) + 'ms';

	return result;
};

var insertCost = function(list, sourceId, targetId, cost){
    if(list) {
        if(list[targetId]) {
            var listMyPlanets = list[targetId];
            listMyPlanets[sourceId] = cost;
            list[targetId] = listMyPlanets;
        } else {
            var listMyPlanets = new Array();
            listMyPlanets[sourceId] = cost;
            list[targetId] = listMyPlanets;
        }
    }
}

var getNbTurnToGoTo = function (source, target) {
    if(source && target) {
        return Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / Game.SHIP_SPEED);
    } else {
        return 0;
    }
}

var getPopPlanetAtArriving = function (source, target) {
    return target.population + (Game.PLANET_GROWTH * getNbTurnToGoTo(source, target));
}

var validatePopNotMaxAtArriving = function(source, target, size) {
    if(source && target) {
        var pop = getPopPlanetAtArriving(source, target);
        var max = PlanetPopulation.getMaxPopulation(target.size);
        if(pop + size > max) {
            return false;
        }
    }
    return true;
}

var addToHash = function(key, value, list) {
    if(list) {
        if(list[key]) {
            var oldValue =  list[key];
            oldValue.push(value);
            list[key] = oldValue;
        } else {
            list[key] = {};
            list[key].push(value);
        }
    }
}

var newArray = function(a) {
    var n = new Array();
    if(a) {
        for(var i=0; i< a.length;i++) {
            n.push(a[i]);
        }
    }
    return n;
}

var setPops = function(context) {
    var planets = context.content;
    //debugMessage += 'planets galaxy :  ' + planets.length + '<br/>';
    for(var i=0;i<planets.length;i++) {
        planetsPop[planets[i].id] = planets[i].population;
        //debugMessage += 'planetsPop[ ' + planets[i].id + ']=' + planetsPop[planets[i].id] + '<br/>';
    }
}

var modifyPop = function(id, size) {
    //debugMessage += 'planetsPop[ ' + id + ']=' + planetsPop[id] + '<br/>';
    var oldSize = planetsPop[id];
    var newSize = oldSize + size;
    planetsPop[id] = newSize;
    //debugMessage += 'planetsPop[ ' + id + ']=' + planetsPop[id] + '<br/>';
}

var removePlanetFrom = function(planet, planets) {
    if(planet && planets) {
        //debugMessage += 'removePlanetFrom : ' + planet.id + '<br/>';
        for(var i=0;i<planets.length; i++) {
            //debugMessage += planets[i].id + ';';
        }
        //debugMessage += '<br/>';
        for(var i = planets.length - 1; i >= 0 ; i--) {
            if(planet.id == planets[i].id) {
                planets.splice(i, 1);
            }
        }
        for(var i=0;i<planets.length; i++) {
            //debugMessage += planets[i].id + ';';
        }
        //debugMessage += '<br/>';
    }
    return planets;
}

var getNearestPlanet = function( source, candidats )
	{
		var result = null;
		var currentDist = Number.POSITIVE_INFINITY;
        if(candidats) {
            for ( var i = 0; i<candidats.length; i++ )
            {
                var element = candidats[ i ];
                if(source && element.id != source.id)  {
                    var dist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
                    if ( currentDist > dist) {
                        currentDist = dist;
                        result = element;
                    }
                }
            }
        }
		return result;
	}


var getNearestAndSmallestPlanet = function( source, candidats )
{
    var result = null;
    var currentDist = Number.POSITIVE_INFINITY;
    if(candidats) {
        for ( var i = 0; i<candidats.length; i++ )
        {
            var element = candidats[ i ];
            if(source && element.id != source.id)  {
                var dist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
                if ( currentDist > (dist * 10 + element.population)) {
                    currentDist = dist * 10 + element.population;
                    result = element;
                }
            }
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

GameUtil.getEnnemyShips  = function(planetOwnerId,context) {
    var result = new Array();
    var _g1 = 0, _g = context.fleet.length;
    while(_g1 < _g) {
        var i = _g1++;
        var s = context.fleet[i];
        if(s.owner.id != planetOwnerId) result.push(s);
    }
    return result;
}

GameUtil.getPlayerShips  = function(planetOwnerId,context) {
    var result = new Array();
    var _g1 = 0, _g = context.fleet.length;
    while(_g1 < _g) {
        var i = _g1++;
        var s = context.fleet[i];
        if(s.owner.id == planetOwnerId) result.push(s);
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

