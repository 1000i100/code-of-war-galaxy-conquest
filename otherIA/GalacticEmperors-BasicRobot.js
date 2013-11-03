(function () { "use strict";
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var com = {}
com.tamina = {}
com.tamina.planetwars = {}
com.tamina.planetwars.data = {}
com.tamina.planetwars.data.IPlayer = function() { }
com.tamina.planetwars.data.IPlayer.__name__ = true;
com.tamina.planetwars.data.IPlayer.prototype = {
	__class__: com.tamina.planetwars.data.IPlayer
}
var WorkerIA = function(name,color) {
	if(color == null) color = 0;
	if(name == null) name = "";
	this.name = name;
	this.color = color;
	this.debugMessage = "";
};
WorkerIA.__name__ = true;
WorkerIA.__interfaces__ = [com.tamina.planetwars.data.IPlayer];
WorkerIA.prototype = {
	postMessage: function(message) {
	}
	,messageHandler: function(event) {
		if(event.data != null) {
			var turnMessage = event.data;
			WorkerIA.instance.id = turnMessage.playerId;
			this.postMessage(new com.tamina.planetwars.data.TurnResult(WorkerIA.instance.getOrders(turnMessage.galaxy),WorkerIA.instance.debugMessage));
		} else this.postMessage("data null");
	}
	,getOrders: function(context) {
		var result = new Array();
		return result;
	}
	,__class__: WorkerIA
}
var GalacticEmperorsIA = function(name,color) {
	this.turnNumber = 0;
	WorkerIA.call(this,name,color);
};
GalacticEmperorsIA.__name__ = true;
GalacticEmperorsIA.main = function() {
	WorkerIA.instance = new GalacticEmperorsIA();
}
GalacticEmperorsIA.__super__ = WorkerIA;
GalacticEmperorsIA.prototype = $extend(WorkerIA.prototype,{
	getUnattakedPlanet: function(candidates,fleet) {
		var result = candidates.slice();
		var _g1 = 0, _g = fleet.length;
		while(_g1 < _g) {
			var i = _g1++;
			HxOverrides.remove(result,fleet[i].target);
		}
		return result;
	}
	,getListOfEnnemyPlanetSortByChanceToConquete: function(myPlanets,ennemyPlanets) {
		var planets = new Array();
		var tempMapPlanets = new Array();
		var moyenne = 0;
		var coeff = 0;
		this.debugMessage += "Dans la methode getListOfEnnemyPlanetSortByChanceToConquete <BR />";
		var _g1 = 0, _g = ennemyPlanets.length;
		while(_g1 < _g) {
			var i = _g1++;
			var currentEnnemyPlanet = ennemyPlanets[i];
			var currentMoyenne = 0;
			var currentCoeff = 0;
			var _g3 = 0, _g2 = myPlanets.length;
			while(_g3 < _g2) {
				var j = _g3++;
				currentMoyenne += this.distanceMap.get(currentEnnemyPlanet.id + ";" + myPlanets[j].id);
				currentCoeff += currentEnnemyPlanet.population / myPlanets[j].population;
			}
			currentMoyenne = currentMoyenne / myPlanets.length;
			currentCoeff = currentCoeff / myPlanets.length;
			tempMapPlanets.push(new fr.roxor.util.Pair(currentMoyenne * currentCoeff,currentEnnemyPlanet));
		}
		tempMapPlanets.sort(function(p1,p2) {
			if(p1.key < p2.key) return -1;
			if(p1.key > p2.key) return 1;
			return 0;
		});
		var _g = 0;
		while(_g < tempMapPlanets.length) {
			var p = tempMapPlanets[_g];
			++_g;
			planets.push(p.value);
		}
		return planets;
	}
	,getNearesEnnemyPlanetOfTheEmpire: function(myPlanets,ennemyPlanets) {
		var planet = null;
		var moyenne = 0;
		this.debugMessage += "Dans la methode getNearesEnnemyPlanetOfTheEmpire <BR />";
		var _g1 = 0, _g = ennemyPlanets.length;
		while(_g1 < _g) {
			var i = _g1++;
			var currentPlanet = ennemyPlanets[i];
			var currentMoyenne = 0;
			var _g3 = 0, _g2 = myPlanets.length;
			while(_g3 < _g2) {
				var j = _g3++;
				currentMoyenne += this.distanceMap.get(currentPlanet.id + ";" + myPlanets[j].id);
			}
			currentMoyenne = currentMoyenne / myPlanets.length;
			if(i == 0) moyenne = currentMoyenne;
			if(currentMoyenne < moyenne) {
				moyenne = currentMoyenne;
				planet = currentPlanet;
			}
		}
		return planet;
	}
	,getNearestEnnemyPlanet: function(source,candidats) {
		var result = candidats[0];
		var currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(result.x,result.y));
		var _g1 = 0, _g = candidats.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = candidats[i];
			if(currentDist > com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y))) {
				currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y));
				result = element;
			}
		}
		return result;
	}
	,simpleAttack: function(source,target,population) {
		return new com.tamina.planetwars.data.Order(source.id,target.id,population);
	}
	,caulculDistances: function(galaxy) {
		this.distanceMap = new haxe.ds.StringMap();
		var _g1 = 0, _g = galaxy.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			var myPlanet = galaxy.content[i];
			var _g3 = 0, _g2 = galaxy.content.length;
			while(_g3 < _g2) {
				var j = _g3++;
				var myOtherPlanet = galaxy.content[j];
				if(myPlanet.id != myOtherPlanet.id) this.distanceMap.set(myPlanet.id + ";" + myOtherPlanet.id,com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(myPlanet.x,myPlanet.y),new com.tamina.planetwars.geom.Point(myOtherPlanet.x,myOtherPlanet.y)));
			}
		}
	}
	,getOrders: function(context) {
		this.turnNumber++;
		this.debugMessage = "Debut du tour : " + this.turnNumber + "<BR />";
		this.debugMessage += "Calcul des distances" + "<BR />";
		if(this.turnNumber == 1) this.caulculDistances(context);
		this.debugMessage += "Distances calculees" + "<BR />";
		var result = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(this.id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets(this.id,context);
		var myFleet = com.tamina.planetwars.utils.GameUtil.getPlayerFleet(this.id,context);
		var ennemyFleet = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,context);
		var unattackedEnnemyPlanets = this.getUnattakedPlanet(otherPlanets,myFleet);
		var galacticPlanetAttackingToRemove = new Array();
		if(this.galacticAttack != null) this.galacticAttack.updateGalacticAttack(context);
		this.debugMessage += "Tentative de recuperation de la plus proche planete de l'empire" + "<BR />";
		var targetPlanet = this.getListOfEnnemyPlanetSortByChanceToConquete(myPlanets,unattackedEnnemyPlanets)[0];
		if(targetPlanet != null) this.debugMessage += "plus proche planete de l'empire : " + targetPlanet.id + "<BR />";
		var attackingPlanets = null;
		if(this.galacticAttack == null && targetPlanet != null) {
			this.debugMessage += "Obtention des planete de la GalacticAttack" + "<BR />";
			attackingPlanets = fr.roxor.tactics.GalacticAttack.getListOfAttackingPlanets(myPlanets,targetPlanet);
			this.debugMessage += "Planete de la galacticAttack obtenue" + "<BR />";
		}
		if(this.galacticAttack == null && attackingPlanets != null && attackingPlanets.length > 0) {
			this.debugMessage += "Creation de la GalacticAttack" + "<BR />";
			this.galacticAttack = new fr.roxor.tactics.GalacticAttack(attackingPlanets,this.turnNumber,targetPlanet);
			this.debugMessage += "GalacticAttack creee" + "<BR />";
		}
		if(this.galacticAttack != null) {
			var _g = 0, _g1 = this.galacticAttack.listOfAttackingPlanets.slice();
			while(_g < _g1.length) {
				var currentAttackingPlanet = _g1[_g];
				++_g;
				if(this.galacticAttack.beginTurn + currentAttackingPlanet.turnToStrike == this.turnNumber) {
					if(currentAttackingPlanet.planet.owner.id == this.id) {
						var forces = 0;
						forces = Math.min(currentAttackingPlanet.planet.population,currentAttackingPlanet.strikeForce) | 0;
						result.push(this.simpleAttack(currentAttackingPlanet.planet,this.galacticAttack.targetPlanet,forces));
						currentAttackingPlanet.planet.population -= forces;
					}
					galacticPlanetAttackingToRemove.push(currentAttackingPlanet);
				}
			}
			if(this.galacticAttack.endTurn <= this.turnNumber - this.galacticAttack.beginTurn) {
				this.galacticAttack = null;
				galacticPlanetAttackingToRemove = null;
			}
		}
		if(otherPlanets != null && otherPlanets.length > 0) {
			var _g1 = 0, _g = myPlanets.length;
			while(_g1 < _g) {
				var i = _g1++;
				var myPlanet = myPlanets[i];
				var potentialTargets = unattackedEnnemyPlanets;
				if(potentialTargets == null || potentialTargets.length == 0) potentialTargets = otherPlanets;
				var target = this.getNearestEnnemyPlanet(myPlanet,potentialTargets);
				var travelNumTurn = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(myPlanet,target);
				var ennemyForcesLimit = Math.min(target.population + travelNumTurn * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size)) | 0;
				var planetCanAttack = true;
				if(this.galacticAttack != null) {
					var _g3 = 0, _g2 = this.galacticAttack.listOfAttackingPlanets.length;
					while(_g3 < _g2) {
						var j = _g3++;
						if(myPlanet.id == this.galacticAttack.listOfAttackingPlanets[j].planet.id) planetCanAttack = true;
					}
				}
				if(planetCanAttack && (myPlanet.population > ennemyForcesLimit || myPlanet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myPlanet.size))) result.push(this.simpleAttack(myPlanet,target,Math.min(ennemyForcesLimit + 1,myPlanet.population) | 0));
			}
		}
		if(this.galacticAttack != null && galacticPlanetAttackingToRemove != null && galacticPlanetAttackingToRemove.length > 0) {
			var _g = 0;
			while(_g < galacticPlanetAttackingToRemove.length) {
				var planetToRemove = galacticPlanetAttackingToRemove[_g];
				++_g;
				HxOverrides.remove(this.galacticAttack.listOfAttackingPlanets,planetToRemove);
			}
		}
		return result;
	}
	,__class__: GalacticEmperorsIA
});
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
var IMap = function() { }
IMap.__name__ = true;
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
com.tamina.planetwars.data.Galaxy = function(width,height) {
	this.width = width;
	this.height = height;
	this.content = new Array();
	this.fleet = new Array();
};
com.tamina.planetwars.data.Galaxy.__name__ = true;
com.tamina.planetwars.data.Galaxy.prototype = {
	contains: function(planetId) {
		var result = false;
		var _g1 = 0, _g = this.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.content[i].id == planetId) {
				result = true;
				break;
			}
		}
		return result;
	}
	,__class__: com.tamina.planetwars.data.Galaxy
}
com.tamina.planetwars.data.Game = function() { }
com.tamina.planetwars.data.Game.__name__ = true;
com.tamina.planetwars.data.Game.get_NUM_PLANET = function() {
	if(com.tamina.planetwars.data.Game.NUM_PLANET == null) com.tamina.planetwars.data.Game.NUM_PLANET = new com.tamina.planetwars.data.Range(5,10);
	return com.tamina.planetwars.data.Game.NUM_PLANET;
}
com.tamina.planetwars.data.Game.get_NEUTRAL_PLAYER = function() {
	if(com.tamina.planetwars.data.Game._NEUTRAL_PLAYER == null) com.tamina.planetwars.data.Game._NEUTRAL_PLAYER = new com.tamina.planetwars.data.Player("neutre",13421772);
	return com.tamina.planetwars.data.Game._NEUTRAL_PLAYER;
}
com.tamina.planetwars.data.Order = function(sourceID,targetID,numUnits) {
	this.sourceID = sourceID;
	this.targetID = targetID;
	this.numUnits = numUnits;
};
com.tamina.planetwars.data.Order.__name__ = true;
com.tamina.planetwars.data.Order.prototype = {
	__class__: com.tamina.planetwars.data.Order
}
com.tamina.planetwars.data.Planet = function(x,y,size,owner) {
	if(size == null) size = 2;
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
	this.size = size;
	this.owner = owner;
	this.population = com.tamina.planetwars.data.PlanetPopulation.getDefaultPopulation(size);
	this.id = Std.string(com.tamina.planetwars.utils.UID.get());
};
com.tamina.planetwars.data.Planet.__name__ = true;
com.tamina.planetwars.data.Planet.prototype = {
	__class__: com.tamina.planetwars.data.Planet
}
com.tamina.planetwars.data.PlanetPopulation = function() { }
com.tamina.planetwars.data.PlanetPopulation.__name__ = true;
com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
	case 1:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_SMALL;
		break;
	case 2:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_NORMAL;
		break;
	case 3:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_BIG;
		break;
	case 4:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_HUGE;
		break;
	}
	return result;
}
com.tamina.planetwars.data.PlanetPopulation.getDefaultPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
	case 1:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_SMALL;
		break;
	case 2:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_NORMAL;
		break;
	case 3:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_BIG;
		break;
	case 4:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_HUGE;
		break;
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize = function() { }
com.tamina.planetwars.data.PlanetSize.__name__ = true;
com.tamina.planetwars.data.PlanetSize.getWidthBySize = function(size) {
	var result = 50;
	switch(size) {
	case 1:
		result = 20;
		break;
	case 2:
		result = 30;
		break;
	case 3:
		result = 50;
		break;
	case 4:
		result = 70;
		break;
	default:
		throw "Taille inconnue : " + Std.string(size);
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize.getExtensionBySize = function(size) {
	var result = "_big";
	switch(size) {
	case 1:
		result = "_small";
		break;
	case 2:
		result = "_normal";
		break;
	case 3:
		result = "_big";
		break;
	case 4:
		result = "_huge";
		break;
	default:
		throw "Taille inconnue : " + Std.string(size);
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize.getRandomPlanetImageURL = function(size) {
	var result = "";
	var rdn = Math.round(Math.random() * 4);
	switch(rdn) {
	case 0:
		result = "images/jupiter" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 1:
		result = "images/lune" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 2:
		result = "images/mars" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 3:
		result = "images/neptune" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 4:
		result = "images/terre" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	}
	return result;
}
com.tamina.planetwars.data.Player = function(name,color,script) {
	if(script == null) script = "";
	if(color == null) color = 0;
	if(name == null) name = "";
	this.name = name;
	this.color = color;
	this.script = script;
	this.id = Std.string(com.tamina.planetwars.utils.UID.get());
};
com.tamina.planetwars.data.Player.__name__ = true;
com.tamina.planetwars.data.Player.__interfaces__ = [com.tamina.planetwars.data.IPlayer];
com.tamina.planetwars.data.Player.prototype = {
	getOrders: function(context) {
		var result = new Array();
		return result;
	}
	,__class__: com.tamina.planetwars.data.Player
}
com.tamina.planetwars.data.Range = function(from,to) {
	if(to == null) to = 1;
	if(from == null) from = 0;
	this.from = from;
	this.to = to;
};
com.tamina.planetwars.data.Range.__name__ = true;
com.tamina.planetwars.data.Range.prototype = {
	__class__: com.tamina.planetwars.data.Range
}
com.tamina.planetwars.data.Ship = function(crew,source,target,creationTurn) {
	this.crew = crew;
	this.source = source;
	this.target = target;
	this.owner = source.owner;
	this.creationTurn = creationTurn;
	this.travelDuration = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
};
com.tamina.planetwars.data.Ship.__name__ = true;
com.tamina.planetwars.data.Ship.prototype = {
	__class__: com.tamina.planetwars.data.Ship
}
com.tamina.planetwars.data.TurnMessage = function(playerId,galaxy) {
	this.playerId = playerId;
	this.galaxy = galaxy;
};
com.tamina.planetwars.data.TurnMessage.__name__ = true;
com.tamina.planetwars.data.TurnMessage.prototype = {
	__class__: com.tamina.planetwars.data.TurnMessage
}
com.tamina.planetwars.data.TurnResult = function(orders,message) {
	if(message == null) message = "";
	this.orders = orders;
	this.consoleMessage = message;
	this.error = "";
};
com.tamina.planetwars.data.TurnResult.__name__ = true;
com.tamina.planetwars.data.TurnResult.prototype = {
	__class__: com.tamina.planetwars.data.TurnResult
}
com.tamina.planetwars.geom = {}
com.tamina.planetwars.geom.Point = function(x,y) {
	this.x = x;
	this.y = y;
};
com.tamina.planetwars.geom.Point.__name__ = true;
com.tamina.planetwars.geom.Point.prototype = {
	__class__: com.tamina.planetwars.geom.Point
}
com.tamina.planetwars.utils = {}
com.tamina.planetwars.utils.GameUtil = function() { }
com.tamina.planetwars.utils.GameUtil.__name__ = true;
com.tamina.planetwars.utils.GameUtil.getDistanceBetween = function(p1,p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}
com.tamina.planetwars.utils.GameUtil.getPlayerPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id == planetOwnerId) result.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getEnnemyFleet = function(playerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.fleet.length;
	while(_g1 < _g) {
		var i = _g1++;
		var s = context.fleet[i];
		if(s.owner.id != playerId) result.push(s);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getPlayerFleet = function(playerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.fleet.length;
	while(_g1 < _g) {
		var i = _g1++;
		var s = context.fleet[i];
		if(s.owner.id == playerId) result.push(s);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getTravelNumTurn = function(source,target) {
	var numTurn = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
	return numTurn;
}
com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id != planetOwnerId) result.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.createRandomGalaxy = function(width,height,padding,playerOne,playerTwo) {
	var result = new com.tamina.planetwars.data.Galaxy(width,height);
	if(playerOne != null) {
		result.firstPlayerHome = new com.tamina.planetwars.data.Planet(padding * 2,padding * 2,3,playerOne);
		result.firstPlayerHome.population = 100;
		result.content.push(result.firstPlayerHome);
	}
	if(playerTwo != null) {
		result.secondPlayerHome = new com.tamina.planetwars.data.Planet(width - padding * 2,height - padding * 2,3,playerTwo);
		result.secondPlayerHome.population = 100;
		result.content.push(result.secondPlayerHome);
	}
	var numPlanet = Math.floor(com.tamina.planetwars.data.Game.get_NUM_PLANET().from + Math.floor(Math.random() * (com.tamina.planetwars.data.Game.get_NUM_PLANET().to - com.tamina.planetwars.data.Game.get_NUM_PLANET().from)));
	var colNumber = Math.floor((result.width - 280) / 70);
	var rawNumber = Math.floor((result.height - 140) / 70);
	var avaiblePositions = new Array();
	var _g1 = 0, _g = colNumber * rawNumber;
	while(_g1 < _g) {
		var i = _g1++;
		avaiblePositions.push(i);
	}
	var _g = 0;
	while(_g < numPlanet) {
		var i = _g++;
		var pos = com.tamina.planetwars.utils.GameUtil.getNewPosition(result,avaiblePositions,colNumber);
		var p = new com.tamina.planetwars.data.Planet(pos.x,pos.y,Math.ceil(Math.random() * 4),com.tamina.planetwars.data.Game.get_NEUTRAL_PLAYER());
		result.content.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getNewPosition = function(currentGalaxy,avaiblePositions,colNumber) {
	var result;
	var index = Math.floor(Math.random() * avaiblePositions.length);
	var caseNumber = avaiblePositions[index];
	avaiblePositions.splice(index,1);
	var columIndex = caseNumber % colNumber;
	var rawIndex = Math.ceil(caseNumber / colNumber);
	result = new com.tamina.planetwars.geom.Point((columIndex + 2) * 70,(rawIndex + 1) * 70);
	return result;
}
com.tamina.planetwars.utils.UID = function() { }
com.tamina.planetwars.utils.UID.__name__ = true;
com.tamina.planetwars.utils.UID.get = function() {
	if(com.tamina.planetwars.utils.UID._lastUID == null) com.tamina.planetwars.utils.UID._lastUID = 0;
	com.tamina.planetwars.utils.UID._lastUID++;
	return com.tamina.planetwars.utils.UID._lastUID;
}
var fr = {}
fr.roxor = {}
fr.roxor.tactics = {}
fr.roxor.tactics.GalacticAttack = function(listOfAttackingPlanets,beginTurn,targetPlanet) {
	this.listOfAttackingPlanets = listOfAttackingPlanets;
	this.beginTurn = beginTurn;
	this.targetPlanet = targetPlanet;
	this.endTurn = 0;
	var _g1 = 0, _g = listOfAttackingPlanets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var currentPlanet = listOfAttackingPlanets[i];
		if(this.endTurn < currentPlanet.turnToStrike) this.endTurn = currentPlanet.turnToStrike;
	}
};
fr.roxor.tactics.GalacticAttack.__name__ = true;
fr.roxor.tactics.GalacticAttack.getListOfAttackingPlanets = function(listOfPlayerPlanets,targetPlanet) {
	var listResult = new Array();
	var attackingPlanet = null;
	var turnToReach = 0;
	var attackPower = 0;
	var defensePower = targetPlanet.population;
	var listToManipule = listOfPlayerPlanets.slice();
	var _g1 = 0, _g = listOfPlayerPlanets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var delayForce = 0;
		attackingPlanet = fr.roxor.tactics.GalacticAttack.getNearestPlanet(targetPlanet,listToManipule);
		turnToReach = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackingPlanet,targetPlanet);
		defensePower = Math.min(targetPlanet.population + turnToReach * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(targetPlanet.size)) | 0;
		attackPower += attackingPlanet.population;
		var _g3 = 0, _g2 = listResult.length;
		while(_g3 < _g2) {
			var j = _g3++;
			var previousAttackingPlanet = listResult[j];
			var previousTurnToReach = previousAttackingPlanet.turnToTarget;
			var turnInAddition = previousAttackingPlanet.turnToStrike + previousTurnToReach - turnToReach;
			previousAttackingPlanet.turnToStrike = turnToReach - previousTurnToReach;
			var forceToAdd = Math.min(turnInAddition * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(previousAttackingPlanet.planet.size)) | 0;
			previousAttackingPlanet.strikeForce += forceToAdd;
			delayForce += forceToAdd;
		}
		listResult.push(new fr.roxor.util.AttackingPlanet(attackingPlanet,attackingPlanet.population,0,turnToReach));
		HxOverrides.remove(listToManipule,attackingPlanet);
		if(attackPower + delayForce > defensePower) {
			var closestPlanet = listResult[0];
			closestPlanet.strikeForce -= attackPower + delayForce - defensePower - 1;
			if(closestPlanet.strikeForce <= 0) HxOverrides.remove(listResult,closestPlanet);
			break;
		} else if(listOfPlayerPlanets.length - 1 == i) return null;
	}
	return listResult;
}
fr.roxor.tactics.GalacticAttack.getNearestPlanet = function(source,candidats) {
	var result = candidats[0];
	var currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(result.x,result.y));
	var _g1 = 0, _g = candidats.length;
	while(_g1 < _g) {
		var i = _g1++;
		var element = candidats[i];
		if(currentDist > com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y))) {
			currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y));
			result = element;
		}
	}
	return result;
}
fr.roxor.tactics.GalacticAttack.prototype = {
	updateGalacticAttack: function(context) {
		if(this.listOfAttackingPlanets == null) return;
		var _g = 0, _g1 = context.content;
		while(_g < _g1.length) {
			var currentPlanet = _g1[_g];
			++_g;
			var _g2 = 0, _g3 = this.listOfAttackingPlanets;
			while(_g2 < _g3.length) {
				var currentAttackingPlanet = _g3[_g2];
				++_g2;
				if(currentPlanet.id == currentAttackingPlanet.planet.id) currentAttackingPlanet.planet = currentPlanet;
			}
		}
	}
	,__class__: fr.roxor.tactics.GalacticAttack
}
fr.roxor.util = {}
fr.roxor.util.AttackingPlanet = function(planet,strikeForce,turnToStrike,turnToTarget,ableToStrikeAgain) {
	if(ableToStrikeAgain == null) ableToStrikeAgain = false;
	this.planet = planet;
	this.strikeForce = strikeForce;
	this.turnToStrike = turnToStrike;
	this.turnToTarget = turnToTarget;
	this.ableToStrikeAgain = ableToStrikeAgain;
};
fr.roxor.util.AttackingPlanet.__name__ = true;
fr.roxor.util.AttackingPlanet.prototype = {
	__class__: fr.roxor.util.AttackingPlanet
}
fr.roxor.util.Pair = function(key,value) {
	this.key = key;
	this.value = value;
};
fr.roxor.util.Pair.__name__ = true;
fr.roxor.util.Pair.prototype = {
	__class__: fr.roxor.util.Pair
}
var haxe = {}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
onmessage = WorkerIA.prototype.messageHandler;
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
com.tamina.planetwars.data.Game.DEFAULT_PLAYER_POPULATION = 100;
com.tamina.planetwars.data.Game.PLANET_GROWTH = 5;
com.tamina.planetwars.data.Game.SHIP_SPEED = 60;
com.tamina.planetwars.data.Game.MAX_TURN_DURATION = 1000;
com.tamina.planetwars.data.Game.GAME_SPEED = 500;
com.tamina.planetwars.data.Game.GAME_DURATION = 240;
com.tamina.planetwars.data.Game.GAME_MAX_NUM_TURN = 500;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_SMALL = 20;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_NORMAL = 30;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_BIG = 40;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_HUGE = 50;
com.tamina.planetwars.data.PlanetPopulation.MAX_SMALL = 50;
com.tamina.planetwars.data.PlanetPopulation.MAX_NORMAL = 100;
com.tamina.planetwars.data.PlanetPopulation.MAX_BIG = 200;
com.tamina.planetwars.data.PlanetPopulation.MAX_HUGE = 300;
com.tamina.planetwars.data.PlanetSize.SMALL = 1;
com.tamina.planetwars.data.PlanetSize.NORMAL = 2;
com.tamina.planetwars.data.PlanetSize.BIG = 3;
com.tamina.planetwars.data.PlanetSize.HUGE = 4;
com.tamina.planetwars.data.PlanetSize.SMALL_WIDTH = 20;
com.tamina.planetwars.data.PlanetSize.NORMAL_WIDTH = 30;
com.tamina.planetwars.data.PlanetSize.BIG_WIDTH = 50;
com.tamina.planetwars.data.PlanetSize.HUGE_WIDTH = 70;
com.tamina.planetwars.data.PlanetSize.SMALL_EXTENSION = "_small";
com.tamina.planetwars.data.PlanetSize.NORMAL_EXTENSION = "_normal";
com.tamina.planetwars.data.PlanetSize.BIG_EXTENSION = "_big";
com.tamina.planetwars.data.PlanetSize.HUGE_EXTENSION = "_huge";
GalacticEmperorsIA.main();
})();
