/*!
 * PlanetWars Javascript
 * http://www.tamina-online.com/expantionreloded/
 *
 *
 * Copyright 2013 Tamina
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * author : Jerome Dufon / Romain Thibault
 */
 
/**
 * nom de l'IA
*/
var name = "TSVM_JS";

/**
 * couleur d'affichage
*/
var color = 0;

var DEBUG = 1;

/** message de debugage
 *  utilisé par le systeme et affiché dans la trace à chaque tour du combat
*/
var debugMessage="";
function initDebugMessage() {
    if( DEBUG == 1 ) {
	debugMessage = "";
    }
}

function addDebugMessage( message ) {
    if( DEBUG == 1 ) {
	debugMessage += message + "<br>";
    }
}

/**
 * activation des message de trace
 * execusion des test (à désactivé en tournoi)
*/
var traceActivated = 1;
var testExecute = 1;

/* Id de l'IA */
var id = 0;
var enemyId = 1;
var INFINITE = 2147483647;
var conquestMargin = 1;
var leaveMargin = 20;
var planetsMap;
var currentTurn = 0;
var myInitialPlanet;
var enemyInitialPlanet;

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
 * @internal method
 * Permet d'afficher des messages pour le debug
*/
function trace( message ) {
	if( traceActivated != 0 ) {
		message.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
		message += "<br/>";
		//var d = document.getElementById("haxe:trace");
		var d = document.getElementById("tracearea");
		if(d != null)
			d.innerHTML += message;
	}
}

/**
 * @internal method
 * Permet de cloner des objets
*/

function clone2(obj){
    try{
        var copy = JSON.parse(JSON.stringify(obj));
    } catch(ex){
        alert("Vous utilisez un vieux navigateur bien pourri, qui n'est pas pris en charge par ce site");
    }
    return copy;
}

function clone(srcInstance)
{
	/*Si l'instance source n'est pas un objet ou qu'elle ne vaut rien c'est une feuille donc on la retourne*/
	if(typeof(srcInstance) != 'object' || srcInstance == null)
	{
		return srcInstance;
	}
	/*On appel le constructeur de l'instance source pour crée une nouvelle instance de la même classe*/
	var newInstance = new srcInstance.constructor();
	/*On parcourt les propriétés de l'objet et on les recopies dans la nouvelle instance*/
	for(var i in srcInstance)
	{
		newInstance[i] = clone(srcInstance[i]);
	}
	/*On retourne la nouvelle instance*/
	return newInstance;
}
var maxForEnnemyMult = 2;
/**
 * Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
 * C'est la methode à modifier pour cabler son IA.
 * @param context:Galaxy
 * @return result:Array<Order>
 */
var getOrders = function(context) {
	
	// Calcul du temps de traitement de la méthode getOrders
	var dateDebut = new Date;
	
	initDebugMessage();
	
	//addDebugMessage( "" );
	//addDebugMessage( "=================================================================================" );
	//addDebugMessage( "Turn " + currentTurn + " - i am " + id );
	
	// Au tour 0, mémorise l'identifiant de l'adversaire et des planètes neutres
	if( currentTurn == 0 ) {
		detectOwnerIds( context.content );
		planetsMap = PlanetDistanceMap(context);
		for( var i = 0 ; i < planetsMap.length ; i++ ) {
			var lst = planetsMap[i];
			var msg = i+" : ";
			for( var j = 0 ; j < lst.length ; j++ ) {
				msg += lst[j].index+"("+lst[j].distance + ") ";
			}
			//addDebugMessage(msg);
		}
	}
	
	// Evaluation des distances de toutes les planètes
	var eval = TimesToConquer(context,currentTurn,id);
	
	for( var i = 0 ; i < eval.length ; i++ ) {
		var dst = eval[i];
		var srcPlanet = context.content[i];
		//addDebugMessage("Planet n°"+i+" id="+srcPlanet.id+" owner="+srcPlanet.owner.id+" pop="+srcPlanet.population+"/"+PlanetPopulation.getMaxPopulation(srcPlanet.size)+" forMe="+dst.forMe+" forEnnemy="+dst.forEnnemy);
		for( var a = 0 ; a < dst.attacks.length ; a++ ) {
			var att = dst.attacks[a];
			//addDebugMessage("&nbsp;&nbsp;&nbsp;&nbsp;Attack n°"+a+": forMe="+att.forMe+" forEnnemy="+att.forEnnemy);
			for( var j = 0 ; j < att.orders.length ; j++ ) {
				var order = att.orders[j];
				//addDebugMessage("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;From n°"+order.sourceID+" crew="+order.numUnits+" turn="+order.turn+" remain="+order.remainPopulation);
			}
		}
	}
	
	// Récupère le max des forEnnemy
	var distanceMax = maxForEnnemy( eval );

	// Calcul du nombre de planete
	var nbMe = 0;
	var nbEnnemy = 0;
	for( var i = 0 ; i < eval.length ; i++ ) {
		var owner = eval[i].owner;
		if( owner == id )
			nbMe++;
		else if( owner == enemyId )
			nbEnnemy++;
	}
	
	// Choix de la meilleur attaque pour chaque planète
	var bestAttacks = new Array();
	for( var i = 0 ; i < eval.length ; i++ ) {
		
		if( eval[i].owner != id ) {
			var attacks = eval[i].attacks;
			for( var j = 0 ; j < attacks.length ; j++ ) {
				var attack = attacks[j];
				attack.note = note(attack,eval,distanceMax,context.content);
			}
			attacks.sort(function(a,b){return b.note - a.note});
			
			if( attacks.length > 0 )
				bestAttacks.push(attacks[0]);
		}
	}

	// Tri des attaques
	bestAttacks.sort(function(a,b){return b.note - a.note});
	//addDebugMessage( "bestAttacks="+bestAttacks.length );
	
	// Recherche de la meilleur solution
	var maxNbAttack = 4;
	var selectedOrders = new Array();
	for( var i = 0 ; (i < bestAttacks.length) && (maxNbAttack > 0) ; i++ ) {
		var attack = bestAttacks[i];
		if( compatible(selectedOrders,attack.orders) > 0 ) {
			maxNbAttack--;
			selectedOrders = selectedOrders.concat(attack.orders);
			//addDebugMessage( "selectAttack="+i );
		}
	}
	
	//addDebugMessage( "maxNbAttack="+maxNbAttack );
	//addDebugMessage( "selectedOrders="+selectedOrders.length );
	
	// Constuction de l'ordre final
	var result = new Array();
	for( var i = 0 ; i < selectedOrders.length ; i++ ) {
		var order = selectedOrders[i];
		if( order.turn == 0 ) {
			result.push(order);
			order.sourceID = context.content[order.sourceID].id;
			order.targetID = context.content[order.targetID].id;
		}
	}
	
	// Incrémentation du numéro du tour
	currentTurn++;
	
	// Calcul du temps de traitement de la méthode getOrders
	var dateFin = new Date;
	//addDebugMessage( "dt=" + ( dateFin.getMilliseconds() - dateDebut.getMilliseconds() ) );
	//addDebugMessage( "=================================================================================" );

	return result;
}

function compatible( order1, order2 ) {
	var ret = 1;
	for( var i = 0 ; (i < order1.length) && (ret > 0) ; i++ ) {
		var o1 = order1[i];
		for( var j = 0 ; (j < order2.length) && (ret > 0) ; j++ ) {
			var o2 = order2[j];
			if( o1.sourceID == o2.sourceID )
				ret = 0;
		}
	}
	return ret;
}
var maxForEnnemyMult = 2;

var compatibilityWeights = new Array( 1, 1, 6, 3, 18 );
/*
  compatibilityWeights[0] : curEvalTime.forMe
  compatibilityWeights[1] : curEvalTime.forEnnemy
  compatibilityWeights[2] : ennemyProximaFactor
  compatibilityWeights[3] : ownerFactor
  compatibilityWeights[4] : lostPLanetFactor
*/
var ownerFactors = new Array( 0, 100, 5 );
/*
  ownerFactors[0] : Allié
  ownerFactors[1] : Ennemi
  ownerFactors[2] : Autre
*/

// Récupère le max des forEnnemy
var maxForEnnemy = function(targets) {

	var result = 0;

	//addDebugMessage( "NbPlanets="+targets.length );
	for( var i = 0 ; i < targets.length ; i++ ) {
		var curTarget = targets[i];
		//addDebugMessage( "ForEnnemy="+i+" "+curTarget.forEnnemy );
		if( result < curTarget.forEnnemy && curTarget.forEnnemy < INFINITE ) {
			result = curTarget.forEnnemy;
		}
		if( result < curTarget.forMe && curTarget.forMe < INFINITE ) {
			result = curTarget.forMe;
		}
	}
	result = result * maxForEnnemyMult;
	//addDebugMessage( "Max des ForEnnemy="+result );

	return result;

}

//var compatibilityTargetsFactor = function( curEvalTime, distanceMax, evalTimes ) {
function note( attack, eval, distanceMax, planets ) {

	var result = attack.forMe;

	var ennemyProximasMessage = "EnnemyProxima Factors :"; // Debug

	var minEnnemyProximaFactor = INFINITE;
	
	ennemyProximasMessage += " NbOrdres="+attack.orders.length+" - "; // Debug

	if( attack.orders.length > 0 ) {
		for( var j = 0; j < attack.orders.length; j++ ) {
			curOrder = attack.orders[j];

			ennemyProximasMessage += " curOrder="+curOrder.sourceID+" fE="+eval[curOrder.sourceID].forEnnemy+" Max"+distanceMax;
			var filteredForEnnemy = eval[curOrder.sourceID].forEnnemy;
			if( filteredForEnnemy == INFINITE ) {
				filteredForEnnemy = distanceMax;
			}
			ennemyProximasMessage += " FFE="+filteredForEnnemy+" "+curOrder.sourceID+"->"+curOrder.targetID+" RemPop="+curOrder.remainPopulation; // Debug
			
			filteredForEnnemy = filteredForEnnemy * curOrder.remainPopulation / ( curOrder.remainPopulation + curOrder.numUnits );

			ennemyProximaFactor = 50.0 * eval[curOrder.sourceID].forMe * maxForEnnemyMult / distanceMax + 50.0 - (50.0 * filteredForEnnemy / distanceMax);
			
			if( minEnnemyProximaFactor > ennemyProximaFactor )
				minEnnemyProximaFactor = ennemyProximaFactor;
		}
	}

	ennemyProximasMessage += " - Coef="+(Math.round( 1000 * minEnnemyProximaFactor ) / 1000); // Debug
	//addDebugMessage(ennemyProximasMessage); // Debug

	var oldOwner = planets[attack.planetId].owner.id;
	var owner = eval[attack.planetId].owner;
	
	//addDebugMessage("attackOwner="+owner); // Debug
	var ownerFactor = 0.0;
	switch( owner ) {
		case enemyId :
			ownerFactor = ownerFactors[1];
			break;
		default :
			ownerFactor = ownerFactors[2];
			break;
	}

	var compatibilityFactor0 = 0.0;
	if( attack.forMe < INFINITE ) {
		compatibilityFactor0 = 100.0 - 100.0 * (attack.forMe * maxForEnnemyMult) / distanceMax;
	}
	var compatibilityFactor1 = 100.0;
	if( attack.forEnnemy < INFINITE ) {
		compatibilityFactor1 = 100.0 * attack.forEnnemy / distanceMax;
	}
	var compatibilityFactor2 = 100.0-minEnnemyProximaFactor;
	var compatibilityFactor3 = ownerFactor;
	var compatibilityFactor4 = 5.0;
	if( (oldOwner == id) && (owner != id) )
		compatibilityFactor4 = 100.0;

	addDebugMessage("Note:"+compatibilityFactor0+" "+compatibilityFactor1+" "+compatibilityFactor2+" "+compatibilityFactor3+" "+compatibilityFactor4); // Debug

	result =
		compatibilityWeights[0] * compatibilityFactor0
		+ compatibilityWeights[1] * compatibilityFactor1
		+ compatibilityWeights[2] * compatibilityFactor2
		+ compatibilityWeights[3] * compatibilityFactor3
		+ compatibilityWeights[4] * compatibilityFactor4;

    return result;
}

function note2( attack, eval, distanceMax ) {
	return attack.forMe;
}

/**
 * @param planets:PlanetArray Les planètes de la Galaxy
 * @global enemyOwnerId:Number L'identifiant de l'adversaire
 * @global neutralOwnerId:Number L'identifiant du neutre
 */
var detectOwnerIds = function( planets ) {
    // Variables temporaires pour comptabiliser les planètes et leurs propriétaires
    var nbPlanets1 = 0;
    var owner1 = -3;
    var nbPlanets2 = 0;
    var owner2 = -4;

    // Parmi toutes les planètes
    var N = planets.length;
    for ( var j=0; j<N; j++ )
    {
	if( planets[j].owner.id == id ) // Si la planète courante est alliée
	{
	    myInitialPlanet = j;
	} else // La planète courante n'est pas alliée
    	{
    	    if( owner1 < 0 ) // Aucune détection pour l'instant (1ère planète visitée)
    	    {
		owner1 = planets[j].owner.id;
		nbPlanets1 = 1;
		enemyInitialPlanet = j;
//		addDebugMessage( "Owner1 " + planets[j].owner.id +" "+ owner1 );
	    } else if( owner1 == planets[j].owner.id ) // Le 1er détecté possède la planète courante
    	    {
    		nbPlanets1++; // Incrémention du nb de planètes pour le 1er détecté
    	    } else if( owner2 != planets[j].owner.id ) // Pas encore de 2ème détecté, on l'a trouvé, c'est sa 1ère planète
    	    {
    		owner2 = planets[j].owner.id;
    		nbPlanets2 = 1;
    	    } else if( owner2 == planets[j].owner.id ) // Le 2ème détecté possède la planète courante
    	    {
    		nbPlanets2++; // Incrémention du nb de planète pour le 2ème détecté
    	    }
    	}
    }
//    addDebugMessage( "TempOwners " + owner1 +" "+ nbPlanets1 +" "+ owner2 +" "+ nbPlanets2 );

    // Le comptage des planète terminé, la planète toute seule est à l'adversaire. Toutes les autres sont au neutre
    if( nbPlanets1 == 1 && nbPlanets2 > 1 ) // C'est le 1er détecté qui est l'adversaire et le 2ème est neutre
    {
    	enemyId = owner1;
    	//neutralOwnerId = owner2;
    } else if( nbPlanets1 > 1 && nbPlanets2 == 1 ) // C'est le 2ème détecté qui est l'adversaire et le 1er est neutre
    {
    	enemyId = owner2;
    	//neutralOwnerId = owner1;
    }
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
	if( crew ) {
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
	}
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

var Player = function( ident ) {
	this.id = ident;
}
Player.ennemy = function( playerId ) {
	var ret = id;
	if( playerId == id )
		ret = enemyId;
	return ret;
}

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
/**
 * PlanetState
 */
function PlanetState( planetDistance, galaxyPlanets, fleet ) {
	
	if( planetDistance ) {
		this.index = planetDistance.index;
		this.planet = galaxyPlanets[planetDistance.index];
		this.fleet = fleet;
		this.distance = planetDistance.distance;
		this.population = this.planet.population;
		this.maxPopulation = planetDistance.maxPopulation;
		this.owner = this.planet.owner.id;
		this.turn = 0;
		this.ship = 0;
	}
}
PlanetState.prototype.growth = function( step ) {
	
	this.turn += step;
	this.population += step * Game.PLANET_GROWTH;
	if( this.population > this.maxPopulation )
		this.population = this.maxPopulation;
}
PlanetState.prototype.shipArrival = function( ship ) {
	
	if( ship.owner.id == this.owner ) {
		this.population += ship.crew;
		if( this.population > this.maxPopulation )
			this.population = this.maxPopulation;
	}
	else {
		this.population -= ship.crew;
		if( this.population < 0 ) {
			this.owner = ship.owner.id;
			this.population = -this.population;
		}
	}
}
PlanetState.prototype.run = function( turn ) {
	
	while( (this.ship < this.fleet.length) && (this.fleet[this.ship].arrival < turn) ) {
		
		var ship = this.fleet[this.ship];
		this.growth(ship.arrival-this.turn);
		this.shipArrival(ship);
		this.ship++;
	}
	
	this.growth(turn-this.turn);
}
PlanetState.prototype.runStep = function() {
	
	this.run(this.turn+1);
}
PlanetState.prototype.shipPending = function() {
	
	return this.fleet.length-this.ship;
}
PlanetState.prototype.crew = function( playerId ) {
	
	var ret = 0;
	if( playerId == this.owner ) {
		ret = this.population - leaveMargin;
		if( ret < 0 )
			ret = 0;
	}
	return ret;
}
PlanetState.prototype.finalState = function( playerId, playerEnemyId ) {
	
	// calcul l'etat final (quand tous les vasseaux sont arrivés)
	this.firstMeOwner = -1;
	this.firstEnnemyOwner = -1;
	this.lastMeShip = -1;
	this.lastEnnemyShip = -1;
	if( this.owner == playerId )
		this.firstMeOwner = this.turn;
	else if( this.owner == playerEnemyId )
		this.firstEnnemyOwner = this.turn;
	
	for( var i = 0 ; i < this.fleet.length ; i++ ) {
		
		var ship = this.fleet[i];
		this.growth(ship.arrival-this.turn);
		this.shipArrival(ship);
		
		if( ship.owner.id == playerId )
			this.lastMeShip = this.turn;
		else if( ship.owner.id == playerEnemyId )
			this.lastEnnemyShip = this.turn;
		
		if( (this.owner == playerId) && (this.firstMeOwner < 0) )
			this.firstMeOwner = this.turn;
		else if( (this.owner == playerEnemyId) && (this.firstEnnemyOwner < 0) )
			this.firstEnnemyOwner = this.turn;
	}
}

/**
 * PlanetDistanceMap
 */
function PlanetDistance( target, source, planets ) {
	var srcPlanet = planets[source];
	var tgtPlanet = planets[target];
	this.index = source;
	this.planet = srcPlanet;
	this.distance = Math.ceil(GameUtil.getDistanceBetween(new Point(srcPlanet.x,srcPlanet.y),new Point(tgtPlanet.x,tgtPlanet.y)) / Game.SHIP_SPEED);
	this.maxPopulation = PlanetPopulation.getMaxPopulation(srcPlanet.size);
}
function PlanetDistanceMap( galaxy ) {
	var planets = galaxy.content;
	map = new Array( planets.length );

	for( var i = 0 ; i < planets.length ; i++ ) {
		
		map[i] = new Array( planets.length );
		
		for( var j = 0 ; j < planets.length ; j++ ) {
			map[i][j] = new PlanetDistance(i,j,planets);
		}
		
		map[i].sort(function(a,b){return a.distance - b.distance});
	}
	
	return map;
}

/**
 * TimesToConquer
 */
function TimesToConquer( galaxy, turn, playerId ) {
	
	var planets = galaxy.content;
	var fleetMap = new Array( planets.length );
	
	var times = new Array( planets.length );
	
	TimesToConquer.sortFleet(galaxy.fleet,turn);
	
	for( var i = 0 ; i < planets.length ; i++ ) {
		var planetId = planets[i].id;
		var fleet = new Array();
		for( var j = 0 ; j < galaxy.fleet.length ; j++ ) {
			var ship = galaxy.fleet[j];
			if( ship.target.id == planetId )
				fleet.push(ship);
		}
		fleetMap[i] = fleet;
	}
	
	for( var i = 0 ; i < planets.length ; i++ ) {
		times[i] = new TimeToConquer(i,playerId,galaxy,fleetMap);
	}
	
	return times;
}
TimesToConquer.sortFleet = function( data, turn ) {
	for( var i = 0 ; i < data.length ; i++ ) {
		var ship = data[i];
		ship.arrival = ship.travelDuration + ship.creationTurn - turn;
	}
	data.sort(function(a,b){return a.arrival - b.arrival});
}

/**
 * TimeToConquer
 */
function TimeToConquer( planetId, playerId, galaxy, fleetMap ) {
	
	var playerEnemyId = Player.ennemy(playerId);
	var planets = galaxy.content;
	var planet = planets[planetId];
	var fleet = galaxy.fleet;
	
	// recherche du voisinage
	var neighborhoodMap = planetsMap[planetId];
	var neighborhoodMe = new Array();
	var neighborhoodEnnemy = new Array();
	
	for( var i = 1 ; i < neighborhoodMap.length ; i++ ) {
		var planetDistance = neighborhoodMap[i];
		var planetState = new PlanetState(planetDistance,planets,fleetMap[planetDistance.index])
		planetState.finalState(playerId,playerEnemyId);
		if( planetState.firstMeOwner >= 0 )
			neighborhoodMe.push(new PlanetState(planetDistance,planets,fleetMap[planetDistance.index]));
		if( planetState.firstEnnemyOwner >= 0 )
			neighborhoodEnnemy.push(new PlanetState(planetDistance,planets,fleetMap[planetDistance.index]));
	}
	
	// etat de la planete
	var planetState = new PlanetState(planetsMap[planetId][0],planets,fleetMap[planetId]);
	planetState.finalState(playerId,playerEnemyId);
	
	var population = planetState.population + conquestMargin;
	var maxPopulation = planetState.maxPopulation + conquestMargin;
	var turn = planetState.turn;
	
	var waitTurnBeforeAttackMe = 0;
	var waitTurnBeforeAttackEnnemy = 0;
	
	if( planetState.firstMeOwner < 0 ) {
		if( planetState.firstEnnemyOwner >= 0 )
			waitTurnBeforeAttackMe = planetState.firstEnnemyOwner;
		else if( planetState.lastEnnemyShip >= 0 )
			waitTurnBeforeAttackMe = planetState.lastEnnemyShip;
	}
	if( planetState.firstEnnemyOwner < 0 ) {
		if( planetState.firstMeOwner >= 0 )
			waitTurnBeforeAttackEnnemy = planetState.firstMeOwner;
		else if( planetState.lastMeShip >= 0 )
			waitTurnBeforeAttackEnnemy = planetState.lastMeShip;
	}
	
	// init
	this.forMe = INFINITE;
	this.forEnnemy = INFINITE;
	this.owner = planetState.owner;
	this.attacks = new Array();
	var attacks;
	
	// evaluation des distance ami/ennemy
	if( planetState.owner == playerId ) {
		attacks = new TimeToPopulate(neighborhoodEnnemy,planetId,playerEnemyId,population,maxPopulation,turn,waitTurnBeforeAttackEnnemy,0);
		if( attacks.length > 0 )
			this.forEnnemy = attacks.forMe;
		attacks = new TimeToPopulate(neighborhoodMe,planetId,playerId,conquestMargin,conquestMargin,turn,0,0);
		if( attacks.length > 0 )
			this.forMe = attacks.forMe;
	}
	else {
		if( planetState.owner == playerEnemyId )
			attacks = new TimeToPopulate(neighborhoodEnnemy,planetId,playerEnemyId,conquestMargin,conquestMargin,turn,0);
		else
			attacks = new TimeToPopulate(neighborhoodEnnemy,planetId,playerEnemyId,population,maxPopulation,turn,waitTurnBeforeAttackEnnemy,0);
		if( attacks.length > 0 )
			this.forEnnemy = attacks[0].forMe;
		attacks = new TimeToPopulate(neighborhoodMe,planetId,playerId,population,maxPopulation,turn,waitTurnBeforeAttackMe,this.forEnnemy);
		if( attacks.length > 0 ) {
			this.forMe = attacks[0].forMe;
			this.attacks = attacks;
		}
	}
}

/**
 * TimeToPopulate
 */
function TimeToPopulate( neighborhood, planetId, playerId, population, maxPopulation, growthTurn, minTurn, forEnnemy ) {

	var ret = new Array();
	
	var attackBeginTurn = 0;
	var attackPlanetNumber = 0;
	var attackDistance = INFINITE;
	var attackTargetPopulation = 0;
	var attackOrders = null;
	
	// recherche de la meilleur attaque suivant le nombre de planete utilisées
	for( var planetNumber = 1 ; planetNumber <= neighborhood.length ; planetNumber++ ) {
		
		var planetsState = clone(neighborhood);
		var furthestPlanetDistance = planetsState[planetNumber-1].distance;
		
		//for( var i = 0 ; i < planetNumber ; i++ )
		//	planetsState[i].run(furthestPlanetDistance-planetsState[i].distance);
		
		var shipPending = 0;
		var beginTurn = 0;
		var populate = 0;
		var prevPopulate = -1;
		var targetPopulation = population;
		var orders = new Array();
		
		while( (populate < targetPopulation) && ((prevPopulate < populate) || (shipPending > 0)) ) {
			
			// calcul population cible
			targetPopulation = population;
			if( furthestPlanetDistance+beginTurn > growthTurn ) {
				targetPopulation += (furthestPlanetDistance+beginTurn-growthTurn)*Game.PLANET_GROWTH;
				if( targetPopulation > maxPopulation )
					targetPopulation = maxPopulation;
			}
			
			// calcul de la population source
			prevPopulate = populate;
			populate = 0;
			orders = new Array();
			for( var i = planetNumber-1 ; i >= 0 ; i-- ) {
				var planetState = planetsState[i];
				var crew = planetState.crew(playerId);
				if( populate + crew > targetPopulation )
					crew = targetPopulation-populate;
				populate += crew;
				if( crew > 0 ) {
					var order = new Order(planetState.index,planetId,crew);
					order.turn = planetState.turn;
					order.remainPopulation = planetState.population-crew;
					orders.push(order);
				}
			}
			
			// avance dans le temps
			shipPending = 0;
			beginTurn++;
			for( var i = 0 ; i < planetsState.length ; i++ ) {
				var planetState = planetsState[i];
				planetState.runStep();
				shipPending += planetState.shipPending();
			}
		}
		
		// enregistrement si l'attaque est possible
		var forMe = furthestPlanetDistance + beginTurn - 1 + targetPopulation/Game.PLANET_GROWTH;
		if( (populate >= targetPopulation) && (forMe > minTurn) )
			ret.push(new Attack(planetId,forMe,forEnnemy,orders));
	}
	
	ret.sort(function(a,b){return a.forMe - b.forMe});
	
	return ret;
}

/**
 * Attack
 */
function Attack( planetId, forMe, forEnnemy, orders ) {
	this.planetId = planetId;
	this.forMe = forMe;
	this.forEnnemy = forEnnemy;
	this.orders = orders;
}

/**
 * Liste tous les déplacements à évaluer à partir de la position courant
*/

function listOrders( galaxy, turn, playerId ) {
	
	// Evaluation des distances de toutes les planètes
	var eval = TimesToConquer(galaxy,turn,playerId);
	var distances = new Array();
	
	// Tri des solutions
	var bestAttacks = new Array();
	for( var i = 0 ; i < eval.length ; i++ ) {
		
		var attacks = eval[i].attacks;
		for( var j = 0 ; j < attacks.length ; j++ ) {
			var attack = attacks[j];
			attack.note = note(attack,eval);
		}
		attacks.sort(function(a,b){return a.note - b.note});
		
		if( attacks.length > 0 )
			bestAttacks.push(attacks[0]);
	}
	
	bestAttacks.sort(function(a,b){return a.note - b.note});
	
	// Selection des meilleurs solution
	var result = new Array();
	var nbSolution = 2;
	if( nbSolution > bestAttacks.length )
		nbSolution = bestAttacks.length;
	for( var i = 0 ; i < nbSolution ; i++ ) {
		result.push(bestAttacks[i].orders);
	}
	
	return result;
}


/**
 * Réalise un ordre sur la position courante
 * 
*/
function applyOrder(galaxy, turn, playerId, orders) {
	
	var child = new Galaxy(galaxy.width,galaxy.height);
	
	child.content = clone(galaxy.content);
	
	for( var i = 0 ; i < galaxy.fleet.length ; i++ ) {
		var ship = galaxy.fleet[i];
		child.fleet.push(new Ship(ship.crew,child.content[ship.source.index],child.content[ship.target.index],ship.creationTurn));
	}
	
	for( var i = 0 ; i < orders.length ; i++ ) {
		
		var order = orders[i];
		
		child.fleet.push(new Ship(order.numUnits,child.content[order.sourceID],child.content[order.targetID],turn));
		child.content[order.sourceID].population -= order.numUnits;
	}
	
	return child;
}

function applyTime( galaxy, turn ) {
	
	var ret = turn;
	
	if( galaxy.fleet.length > 0 ) {
		
		/* Tri de vaisseau dans l'ordre d'arrivee */
		TimesToConquer.sortFleet(galaxy.fleet,turn);
		
		/* Date d'avancée dans le temps */
		var arrival = galaxy.fleet[0].arrival;
		ret = turn + arrival;
		
		/* Evolution des planètes */
		for( i = 0 ; i < galaxy.content.length ; ++i ) {
			var population = galaxy.content[i].population + Game.PLANET_GROWTH*arrival;
			var population_max = PlanetPopulation.getMaxPopulation(galaxy.content[i].size);
			if( population > population_max )
				population = population_max;
			galaxy.content[i].population = population;
		}
		
		/* Traitement des vaisseaux */
		for( i = 0 ; (i < galaxy.fleet.length) && (arrival == galaxy.fleet[i].arrival) ; ++i ) {
			
			var ship = galaxy.fleet[i];
			
			if( ship.owner == ship.target.owner ) { /* renfort */
				
				var population = ship.target.population + ship.crew;
				var population_max = PlanetPopulation.getMaxPopulation(ship.target.size);
				if(  population > population_max ) {
					population = population_max;
				}
				ship.target.population = population;
			}
			else { /* attaque */
				
				var population = ship.target.population - ship.crew;
				if( population < 0 ) {
					population = -population;
					ship.target.owner = ship.owner;
				}
				ship.target.population = population;
			}
			
			galaxy.fleet.splice(galaxy.fleet.indexOf(ship),1)
		}
	}
	
	return ret;
}


/**
 * Evaluation de la position courante
 * 
*/
function evaluate( galaxy ) {
	
	var playerPopulation = 0;
	var ennemyPopulation = 0;
	
	for( i = 0 ; i < galaxy.content.length ; i++ ) {
		
		var p = galaxy.content[i];
		
		if( p.owner == id )
			playerPopulation += p.population;
		else if( p.owner == enemyId )
			ennemyPopulation += p.population;
	}
	
	return 1.0*playerPopulation/(playerPopulation+ennemyPopulation);
}



/**
 * Evaluation de la position courante par l'algorithme Alphabeta
 * 
*/

function alphabetaEvaluate( galaxy, turn, playerId, alpha, beta, depth )
{
	var t;
	
	trace("Alphabeta "+depth+" "+playerId);
	
	if( depth > 0 ) { /* Si on n'a pas atteind la profondeur de parcourt max */
		
		var orders = listOrders(galaxy, turn, playerId);
		
		if( orders.length > 0 ) { /* Si la partie n'est pas finie */
			
			var i;
			
			for( i = 0 ; (i < orders.length) && (alpha < beta) ; ++i ) {
				
				var child = applyOrder(galaxy, turn, playerId, orders[i]);
				var childTurn = turn;
				
				if( playerId != id )
					childTurn = applyTime(child,turn);
				
				t = alphabetaEvaluate(child, childTurn, Player.ennemy(playerId), alpha, beta, depth-1);
				
				if( playerId == id ) { /* cas noeud max */
					if( t >= alpha )
						alpha = t;
				}
				else { /* cas noeud min */
					if( t <= beta )
						beta = t;
				}
			}
		}
		else { /* Si la partie est finie il faut déterminer le gagnant */
			
			if( playerId == id )
				t = -INFINITE;
			else
				t = INFINITE;
		}
	}
	else { /* Si on a atteind la profondeur max on evalue avec la fonction */
		
		t = evaluate(galaxy);
	}
	
	return t;
}

/* ==================================================================================================
 * Section de codage des tests de l'ia
 *
*/
if( testExecute != 0 ) {

trace("Start");

var p0 = new Player(0);
var p1 = new Player(1);
var p2 = new Player(2);

var galaxy1 = new Galaxy( 400, 300 );
galaxy1.content.push( new Planet( 25, 25, 3, p0 ) );
galaxy1.content.push( new Planet( 375, 275, 3, p1 ) );
galaxy1.content.push( new Planet( 120, 120, 3, p2 ) );
galaxy1.content.push( new Planet( 271, 171, 2, p2 ) );
galaxy1.content.push( new Planet( 105, 205, 4, p2 ) );
galaxy1.content.push( new Planet( 168, 168, 3, p2 ) );
galaxy1.content.push( new Planet( 248, 248, 3, p2 ) );
galaxy1.content.push( new Planet( 307, 107, 2, p2 ) );
galaxy1.content.push( new Planet( 280, 180, 3, p2 ) );
galaxy1.content.push( new Planet( 151, 51, 2, p2 ) );
galaxy1.content.push( new Planet( 91, 191, 2, p2 ) );
galaxy1.content.push( new Planet( 262, 162, 1, p2 ) );
galaxy1.content.push( new Planet( 293, 193, 4, p2 ) );
galaxy1.content.push( new Planet( 133, 133, 4, p2 ) );
galaxy1.content.push( new Planet( 164, 64, 3, p2 ) );
galaxy1.content.push( new Planet( 291, 191, 2, p2 ) );
galaxy1.content.push( new Planet( 305, 205, 4, p2 ) );
galaxy1.content.push( new Planet( 160, 60, 3, p2 ) );
galaxy1.content.push( new Planet( 334, 234, 1, p2 ) );
galaxy1.content.push( new Planet( 135, 235, 2, p2 ) );
galaxy1.content.push( new Planet( 224, 224, 3, p2 ) );
galaxy1.content.push( new Planet( 218, 118, 1, p2 ) );
galaxy1.content.push( new Planet( 129, 229, 4, p2 ) );
galaxy1.content.push( new Planet( 59, 159, 2, p2 ) );
galaxy1.content.push( new Planet( 221, 121, 4, p2 ) );
galaxy1.content.push( new Planet( 108, 208, 3, p2 ) );
galaxy1.content.push( new Planet( 263, 163, 2, p2 ) );
galaxy1.content.push( new Planet( 283, 183, 2, p2 ) );
galaxy1.content.push( new Planet( 73, 173, 4, p2 ) );
galaxy1.content.push( new Planet( 310, 210, 1, p2 ) );
galaxy1.content.push( new Planet( 99, 199, 2, p2 ) );
galaxy1.content.push( new Planet( 340, 240, 3, p2 ) );

//var eval = alphabetaEvaluate(galaxy1, id, -INFINITE, INFINITE, 3);
//trace("Val = "+eval);

planetsMap = PlanetDistanceMap(galaxy1);
for( var i = 0 ; i < planetsMap.length ; i++ ) {
	var msg = "Pl n"+i+": ";
	for( var j = 0 ; j < planetsMap[i].length ; j++ ) {
		msg += planetsMap[i][j].index+"("+planetsMap[i][j].distance+") ";
	}
	trace(msg);
}

console.time('timer1');
var eval = TimesToConquer(galaxy1,id);
console.timeEnd('timer1'); // this prints times on the console

for( var i = 0 ; i < eval.length ; i++ ) {
	var dst = eval[i];
	trace("It "+i+": "+dst.forMe+"/"+dst.forEnnemy+" "+dst.turn);
}

console.time('timer0');
var titi = getOrders(galaxy1);
console.timeEnd('timer0');

for( var i = 0 ; i < galaxy1.content.length ; i++ )
	galaxy1.content[i].index = i;
console.time('timerAlphabeta');
var ab = alphabetaEvaluate(galaxy1, 0, id, -INFINITE, INFINITE, 3);
console.timeEnd('timerAlphabeta');

trace("Finished.");

}
