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
}
var GalacticEmperorsIA = function(name,color) {
	if(color == null) color = 0;
	if(name == null) name = "";
	this.turnNumber = 0;
	WorkerIA.call(this,name,color);
	this.debugMessageObject = fr.roxor.util.DebugMessage.instance;
	this.targetPlanets = new fr.roxor.util.TargetPlanets();
	this.myPlanets = new Array();
	this.neutralOportunistPlanets = new Array();
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
			if(fleet[i].crew > 0) HxOverrides.remove(result,fleet[i].target);
		}
		return result;
	}
	,getListOfEnnemyPlanetSortByChanceToConquete: function(myPlanets,ennemyPlanets) {
		var planets = new Array();
		var tempMapPlanets = new Array();
		var moyenne = 0;
		var coeff = 0;
		var _g1 = 0, _g = ennemyPlanets.length;
		while(_g1 < _g) {
			var i = _g1++;
			var currentEnnemyPlanet = ennemyPlanets[i];
			var currentMoyenne = 0;
			var currentCoeff = 0;
			var _g3 = 0, _g2 = myPlanets.length;
			while(_g3 < _g2) {
				var j = _g3++;
				currentMoyenne += fr.roxor.util.PlanetUtil.distanceMap.get(currentEnnemyPlanet.id + ";" + myPlanets[j].planet.id);
				currentCoeff += currentEnnemyPlanet.population / myPlanets[j].planet.population;
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
		var _g1 = 0, _g = ennemyPlanets.length;
		while(_g1 < _g) {
			var i = _g1++;
			var currentPlanet = ennemyPlanets[i];
			var currentMoyenne = 0;
			var _g3 = 0, _g2 = myPlanets.length;
			while(_g3 < _g2) {
				var j = _g3++;
				currentMoyenne += fr.roxor.util.PlanetUtil.distanceMap.get(currentPlanet.id + ";" + myPlanets[j].id);
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
	,getOrders: function(context) {
		this.turnNumber++;
		this.debugMessageObject.debugMessage = "";
		this.debugMessageObject.addMessage("Debut du tour : " + this.turnNumber);
		if(this.turnNumber == 1) fr.roxor.util.PlanetUtil.caulculDistances(context);
		var result = new Array();
		fr.roxor.bean.OrderPlanet.updatePlayerOrderPlanets(this.id,context,this.myPlanets,this.debugMessageObject);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets(this.id,context);
		var myFleet = com.tamina.planetwars.utils.GameUtil.getPlayerFleet(this.id,context);
		var ennemyFleet = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,context);
		var unattackedEnnemyPlanets = this.getUnattakedPlanet(otherPlanets,myFleet);
		var galacticPlanetAttackingToRemove = new Array();
		var _g = 0, _g1 = this.neutralOportunistPlanets.slice();
		while(_g < _g1.length) {
			var currentNeutral = _g1[_g];
			++_g;
			if(currentNeutral.turnTaken < this.turnNumber) HxOverrides.remove(this.neutralOportunistPlanets,currentNeutral);
		}
		var attackedNeutral = fr.roxor.tactics.GalacticSniff.getNeutralPlanetsAttackedWithSucces(ennemyFleet,this.turnNumber,unattackedEnnemyPlanets);
		if(attackedNeutral != null && attackedNeutral.length > 0) {
			var _g = 0;
			while(_g < attackedNeutral.length) {
				var neutralPlanet = attackedNeutral[_g];
				++_g;
				var okToSniff = true;
				var _g1 = 0, _g2 = this.neutralOportunistPlanets;
				while(_g1 < _g2.length) {
					var currentSniffedNeutral = _g2[_g1];
					++_g1;
					if(currentSniffedNeutral.planet.id == neutralPlanet.planet.id) {
						okToSniff = false;
						break;
					}
				}
				if(okToSniff) {
					var listOfAttackingOpportunist = fr.roxor.tactics.GalacticSniff.getAttackingPlanet(neutralPlanet,this.myPlanets,this.turnNumber);
					if(listOfAttackingOpportunist != null && listOfAttackingOpportunist.length > 0) {
						this.debugMessageObject.addMessage("Opportunisme en cour !!!");
						this.neutralOportunistPlanets.push(neutralPlanet);
					}
				}
			}
		}
		var targetPlanet = this.getListOfEnnemyPlanetSortByChanceToConquete(this.myPlanets,unattackedEnnemyPlanets)[0];
		var attackingPlanets = null;
		if(targetPlanet != null) attackingPlanets = fr.roxor.tactics.GalacticAttack.getListOfAttackingPlanets(this.myPlanets,targetPlanet,this.turnNumber);
		if(attackingPlanets != null) {
		}
		var defendingPlanets = null;
		var planetToDefend = null;
		var listOfBackupPlanets = null;
		if(ennemyFleet != null) defendingPlanets = fr.roxor.tactics.GalacticDefense.getPlanetToDefend(ennemyFleet,this.id,myFleet);
		if(defendingPlanets != null && defendingPlanets.length > 0) {
			var _g = 0;
			while(_g < defendingPlanets.length) {
				var currentDefendingPlanet = defendingPlanets[_g];
				++_g;
				listOfBackupPlanets = fr.roxor.tactics.GalacticDefense.getBackUpPlanets(currentDefendingPlanet,this.myPlanets,this.turnNumber);
			}
			if(listOfBackupPlanets != null) this.debugMessageObject.addMessage("Back Up Planet Size : " + listOfBackupPlanets.length);
		}
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var currentPlanet = _g1[_g];
			++_g;
			var orders = currentPlanet.getOrders(this.turnNumber);
			result = result.concat(orders);
			currentPlanet.orderMap.remove(this.turnNumber);
			var it = currentPlanet.orderMap.iterator();
			var nbOrders = 0;
			while(it.hasNext()) nbOrders += it.next().length;
		}
		this.debugMessage = this.debugMessageObject.debugMessage;
		return result;
	}
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
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
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
}
com.tamina.planetwars.data.Range = function(from,to) {
	if(to == null) to = 1;
	if(from == null) from = 0;
	this.from = from;
	this.to = to;
};
com.tamina.planetwars.data.Range.__name__ = true;
com.tamina.planetwars.data.Ship = function(crew,source,target,creationTurn) {
	this.crew = crew;
	this.source = source;
	this.target = target;
	this.owner = source.owner;
	this.creationTurn = creationTurn;
	this.travelDuration = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
};
com.tamina.planetwars.data.Ship.__name__ = true;
com.tamina.planetwars.data.TurnMessage = function(playerId,galaxy) {
	this.playerId = playerId;
	this.galaxy = galaxy;
};
com.tamina.planetwars.data.TurnMessage.__name__ = true;
com.tamina.planetwars.data.TurnResult = function(orders,message) {
	if(message == null) message = "";
	this.orders = orders;
	this.consoleMessage = message;
	this.error = "";
};
com.tamina.planetwars.data.TurnResult.__name__ = true;
com.tamina.planetwars.geom = {}
com.tamina.planetwars.geom.Point = function(x,y) {
	this.x = x;
	this.y = y;
};
com.tamina.planetwars.geom.Point.__name__ = true;
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
fr.roxor.bean = {}
fr.roxor.bean.BackUpPlanet = function() {
};
fr.roxor.bean.BackUpPlanet.__name__ = true;
fr.roxor.bean.DefendingPlanet = function() {
	this.listOfAttack = new haxe.ds.IntMap();
};
fr.roxor.bean.DefendingPlanet.__name__ = true;
fr.roxor.bean.DefendingPlanet.prototype = {
	sortListOfAttack: function() {
		var keys = this.listOfAttack.keys();
		var tempList = new Array();
		var finalList = new haxe.ds.IntMap();
		while(keys.hasNext()) tempList.push(keys.next());
		tempList.sort(function(p1,p2) {
			if(p1 < p2) return -1;
			if(p1 > p2) return 1;
			return 0;
		});
		var _g = 0;
		while(_g < tempList.length) {
			var turn = tempList[_g];
			++_g;
			finalList.set(turn,this.listOfAttack.get(turn));
		}
		this.listOfAttack = finalList;
	}
}
fr.roxor.bean.NeutralTakenPlanet = function() {
};
fr.roxor.bean.NeutralTakenPlanet.__name__ = true;
fr.roxor.bean.OrderPlanet = function(planet) {
	this.planet = planet;
	this.currentPopulation = planet.population;
	this.orderMap = new haxe.ds.IntMap();
};
fr.roxor.bean.OrderPlanet.__name__ = true;
fr.roxor.bean.OrderPlanet.updatePlayerOrderPlanets = function(id,context,myPlanets,debugMessage) {
	var playerPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
	var toAdd = true;
	var _g = 0, _g1 = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
	while(_g < _g1.length) {
		var currentPlanet = _g1[_g];
		++_g;
		toAdd = true;
		var _g2 = 0;
		while(_g2 < myPlanets.length) {
			var currentOrderPlanet = myPlanets[_g2];
			++_g2;
			if(currentPlanet.id == currentOrderPlanet.planet.id) {
				currentOrderPlanet.planet = currentPlanet;
				toAdd = false;
				break;
			}
		}
		if(toAdd) myPlanets.push(new fr.roxor.bean.OrderPlanet(currentPlanet));
	}
	var toDelete = true;
	var _g = 0, _g1 = myPlanets.slice();
	while(_g < _g1.length) {
		var currentOrderPlanet = _g1[_g];
		++_g;
		toDelete = true;
		var _g2 = 0, _g3 = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
		while(_g2 < _g3.length) {
			var currentPlanet = _g3[_g2];
			++_g2;
			if(currentPlanet.id == currentOrderPlanet.planet.id) {
				currentOrderPlanet.planet = currentPlanet;
				toDelete = false;
				break;
			}
		}
		if(toDelete) HxOverrides.remove(myPlanets,currentOrderPlanet);
	}
}
fr.roxor.bean.OrderPlanet.getlistPlanet = function(orderPlanetList) {
	var listResult = new Array();
	var _g = 0;
	while(_g < orderPlanetList.length) {
		var currentOrderPlanet = orderPlanetList[_g];
		++_g;
		listResult.push(currentOrderPlanet.planet);
	}
	return listResult;
}
fr.roxor.bean.OrderPlanet.getNearestOrderPlanet = function(targetPlanet,orderPlanetList,index) {
	var result = orderPlanetList[0];
	var currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(targetPlanet.x,targetPlanet.y),new com.tamina.planetwars.geom.Point(result.planet.x,result.planet.y));
	var currentDistanceList = new Array();
	currentDistanceList.push(new fr.roxor.util.Pair(currentDist,result));
	var _g1 = 0, _g = orderPlanetList.length;
	while(_g1 < _g) {
		var i = _g1++;
		var element = orderPlanetList[i];
		currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(targetPlanet.x,targetPlanet.y),new com.tamina.planetwars.geom.Point(element.planet.x,element.planet.y));
		currentDistanceList.push(new fr.roxor.util.Pair(currentDist,element));
	}
	currentDistanceList.sort(function(p1,p2) {
		if(p1.key < p2.key) return -1;
		if(p1.key > p2.key) return 1;
		return 0;
	});
	if(index < currentDistanceList.length && currentDistanceList[index] != null) result = currentDistanceList[index].value; else result = currentDistanceList[0].value;
	return result;
}
fr.roxor.bean.OrderPlanet.prototype = {
	getOrders: function(turn) {
		var listOfCurrentOrder = this.orderMap.get(turn);
		var listResult = new Array();
		if(listOfCurrentOrder != null) {
			var _g = 0;
			while(_g < listOfCurrentOrder.length) {
				var currentOrder = listOfCurrentOrder[_g];
				++_g;
				if(currentOrder.numUnits <= this.planet.population) {
					listResult.push(currentOrder);
					this.planet.population -= currentOrder.numUnits;
				} else {
				}
			}
		}
		return listResult;
	}
	,getPopulationAvailableForTurn: function(currentTurn) {
		var turns = this.orderMap.keys();
		var lastTurn = currentTurn;
		var availablePop = this.planet.population;
		while( turns.hasNext() ) {
			var i = turns.next();
			if(i >= currentTurn) {
				availablePop = Math.min(availablePop + (i - lastTurn) * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(this.planet.size)) | 0;
				var _g = 0, _g1 = this.orderMap.get(i);
				while(_g < _g1.length) {
					var currentOrder = _g1[_g];
					++_g;
					availablePop -= currentOrder.numUnits;
				}
			}
			lastTurn = i;
		}
		return Math.max(0,availablePop) | 0;
	}
	,getPopulationAvailableForTurnInFutur: function(currentTurn,turnInFutur) {
		var turns = this.orderMap.keys();
		var lastTurn = currentTurn;
		var availablePop = this.planet.population;
		while( turns.hasNext() ) {
			var i = turns.next();
			if(i < turnInFutur) availablePop = Math.min(availablePop + (i - lastTurn) * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(this.planet.size)) | 0;
			if(i >= currentTurn) {
				availablePop = Math.min(availablePop + (i - lastTurn) * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(this.planet.size)) | 0;
				var _g = 0, _g1 = this.orderMap.get(i);
				while(_g < _g1.length) {
					var currentOrder = _g1[_g];
					++_g;
					availablePop -= currentOrder.numUnits;
				}
			}
			lastTurn = i;
		}
		return Math.max(0,availablePop) | 0;
	}
	,addOrder: function(turn,destination,force) {
		var order = new com.tamina.planetwars.data.Order(this.planet.id,destination.id,force);
		var orderList = this.orderMap.get(turn);
		if(orderList == null) {
			orderList = new Array();
			orderList.push(order);
			this.orderMap.set(turn,orderList);
		} else orderList.push(order);
	}
}
fr.roxor.tactics = {}
fr.roxor.tactics.GalacticAttack = function(listOfAttackingPlanets,beginTurn,targetPlanet) {
	this.listOfAttackingPlanets = listOfAttackingPlanets;
	this.beginTurn = beginTurn;
	this.targetPlanet = targetPlanet;
	this.endTurn = 0;
};
fr.roxor.tactics.GalacticAttack.__name__ = true;
fr.roxor.tactics.GalacticAttack.getListOfAttackingPlanets = function(listOfPlayerPlanets,targetPlanet,currentTurn) {
	var listOfAttackingPlanet = new Array();
	var attackingPlanet = null;
	var turnToReach = 0;
	var attackPower = 0;
	var defensePower = targetPlanet.population;
	var listToManipule = fr.roxor.bean.OrderPlanet.getlistPlanet(listOfPlayerPlanets);
	var delayForce = 0;
	var _g1 = 0, _g = listOfPlayerPlanets.length;
	while(_g1 < _g) {
		var i = _g1++;
		attackingPlanet = fr.roxor.util.PlanetUtil.getNearestPlanet(targetPlanet,listToManipule);
		var attackingOrderPlanet = fr.roxor.bean.OrderPlanet.getNearestOrderPlanet(targetPlanet,listOfPlayerPlanets,i);
		turnToReach = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackingPlanet,targetPlanet) + currentTurn;
		defensePower = Math.min(targetPlanet.population + (turnToReach - currentTurn) * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(targetPlanet.size)) | 0;
		var currentAvailableForce = attackingOrderPlanet.getPopulationAvailableForTurn(currentTurn);
		attackPower += currentAvailableForce;
		var _g3 = 0, _g2 = listOfAttackingPlanet.length;
		while(_g3 < _g2) {
			var j = _g3++;
			var previousAttackingPlanet = listOfAttackingPlanet[j];
			var previousTurnToReach = previousAttackingPlanet.turnToReach;
			var previousTurnToStrike = previousAttackingPlanet.turnToStrike;
			var turnInAddition = turnToReach - previousTurnToReach;
			previousAttackingPlanet.turnToStrike += turnInAddition;
			previousAttackingPlanet.turnToReach += turnInAddition;
			var forceToAdd = Math.min(turnInAddition * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(previousAttackingPlanet.planet.size) - previousAttackingPlanet.strikeForce) | 0;
			var previousOrderPlanet = null;
			var _g4 = 0;
			while(_g4 < listOfPlayerPlanets.length) {
				var currentOrderPlanet = listOfPlayerPlanets[_g4];
				++_g4;
				if(currentOrderPlanet.planet.id == previousAttackingPlanet.planet.id) previousOrderPlanet = currentOrderPlanet;
			}
			var delayAvailable = previousOrderPlanet.getPopulationAvailableForTurn(previousAttackingPlanet.turnToStrike) - previousAttackingPlanet.strikeForce;
			if(delayAvailable < 0) delayAvailable = 0;
			forceToAdd = Math.min(forceToAdd,delayAvailable) | 0;
			previousAttackingPlanet.strikeForce += forceToAdd;
			delayForce += forceToAdd;
		}
		listOfAttackingPlanet.push(new fr.roxor.util.AttackingPlanet(attackingPlanet,currentAvailableForce,currentTurn,turnToReach));
		HxOverrides.remove(listToManipule,attackingPlanet);
		if(attackPower + delayForce > defensePower) {
			var totalForce = attackPower + delayForce;
			var _g2 = 0, _g3 = listOfAttackingPlanet.slice();
			while(_g2 < _g3.length) {
				var currentAttackingPlanet = _g3[_g2];
				++_g2;
				var resteForce = totalForce - defensePower - 1;
				if(resteForce > currentAttackingPlanet.strikeForce) {
					HxOverrides.remove(listOfAttackingPlanet,currentAttackingPlanet);
					totalForce -= currentAttackingPlanet.strikeForce;
				} else {
					currentAttackingPlanet.strikeForce -= resteForce;
					break;
				}
			}
			break;
		} else if(listOfPlayerPlanets.length - 1 == i) return null;
	}
	var _g = 0;
	while(_g < listOfAttackingPlanet.length) {
		var currentAttacking = listOfAttackingPlanet[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < listOfPlayerPlanets.length) {
			var currentOrder = listOfPlayerPlanets[_g1];
			++_g1;
			if(currentAttacking.planet.id == currentOrder.planet.id) currentOrder.addOrder(currentAttacking.turnToStrike,targetPlanet,currentAttacking.strikeForce);
		}
	}
	return listOfAttackingPlanet;
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
}
fr.roxor.tactics.GalacticDefense = function() {
};
fr.roxor.tactics.GalacticDefense.__name__ = true;
fr.roxor.tactics.GalacticDefense.getPlanetToDefend = function(ennemyFleet,idIA,myFleet) {
	var listOfPlanetsUnderAttack = new Array();
	var _g = 0;
	while(_g < ennemyFleet.length) {
		var currentShip = ennemyFleet[_g];
		++_g;
		if(currentShip.target.owner.id == idIA) {
			var alreadyPresent = false;
			var alreadyDefended = false;
			var _g1 = 0;
			while(_g1 < listOfPlanetsUnderAttack.length) {
				var attackedPlanet = listOfPlanetsUnderAttack[_g1];
				++_g1;
				if(attackedPlanet.planet.id == currentShip.target.id) {
					var turnOfAttack = currentShip.creationTurn + currentShip.travelDuration;
					var attackingCrew = attackedPlanet.listOfAttack.get(turnOfAttack);
					if(attackingCrew == null) attackingCrew = 0;
					attackedPlanet.listOfAttack.set(turnOfAttack,attackingCrew + currentShip.crew);
					alreadyPresent = true;
				}
			}
			var _g1 = 0;
			while(_g1 < myFleet.length) {
				var myShip = myFleet[_g1];
				++_g1;
				if(myShip.target.id == currentShip.target.id && currentShip.crew > 0) {
					alreadyDefended = true;
					break;
				}
			}
			if(!alreadyPresent && !alreadyDefended) {
				var defendingPlanet = new fr.roxor.bean.DefendingPlanet();
				defendingPlanet.planet = currentShip.target;
				var turnOfAttack = currentShip.creationTurn + currentShip.travelDuration;
				defendingPlanet.listOfAttack.set(turnOfAttack,currentShip.crew);
				listOfPlanetsUnderAttack.push(defendingPlanet);
			}
		}
	}
	return listOfPlanetsUnderAttack;
}
fr.roxor.tactics.GalacticDefense.getThreateningEnnemyFleet = function(ennemyFleet,iaId) {
	var threateningShips = new Array();
	var _g = 0;
	while(_g < ennemyFleet.length) {
		var currentShip = ennemyFleet[_g];
		++_g;
		if(currentShip.target.owner.id == iaId) threateningShips.push(currentShip);
	}
	return threateningShips;
}
fr.roxor.tactics.GalacticDefense.getBackUpPlanets = function(planetToDefend,candidatePlanets,currentTurn) {
	if(candidatePlanets == null || candidatePlanets.length <= 0) return null;
	var listResult = new Array();
	var attackingPlanet = null;
	var turnToReach = 0;
	var currentPopulation = planetToDefend.planet.population;
	var cloneCandidatePlanet = fr.roxor.bean.OrderPlanet.getlistPlanet(candidatePlanets);
	var previousTurn = currentTurn;
	var $it0 = planetToDefend.listOfAttack.keys();
	while( $it0.hasNext() ) {
		var turnOfAttack = $it0.next();
		var ennemyAttackPower = planetToDefend.listOfAttack.get(turnOfAttack);
		var delayOfAttack = turnOfAttack - currentTurn;
		var delaySinceLast = turnOfAttack - previousTurn;
		var currentPopulation1 = Math.min(currentPopulation + delaySinceLast * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planetToDefend.planet.size)) | 0;
		currentPopulation1 = currentPopulation1 - ennemyAttackPower;
		if(currentPopulation1 < 0) {
			var _g = 0;
			while(_g < candidatePlanets.length) {
				var candidate = candidatePlanets[_g];
				++_g;
				if(cloneCandidatePlanet.length > 0) {
					var nearestPlanet = fr.roxor.util.PlanetUtil.getNearestPlanet(planetToDefend.planet,cloneCandidatePlanet);
					var distanceBackUp = fr.roxor.util.PlanetUtil.distanceMap.get(nearestPlanet.id + ";" + planetToDefend.planet.id);
					var newHelp = 0;
					if(distanceBackUp <= delayOfAttack) {
						var delayOfBackUp = delayOfAttack - distanceBackUp;
						var helpingForces = 0;
						var backUPlanet = new fr.roxor.bean.BackUpPlanet();
						backUPlanet.planet = nearestPlanet;
						backUPlanet.turnToLaunch = currentTurn + delayOfBackUp;
						helpingForces = candidate.getPopulationAvailableForTurn(currentTurn);
						newHelp = helpingForces;
						backUPlanet.forceToSend = helpingForces;
						backUPlanet.planetToBackUp = planetToDefend.planet;
						listResult.push(backUPlanet);
					}
					HxOverrides.remove(cloneCandidatePlanet,nearestPlanet);
					currentPopulation1 += newHelp;
					if(currentPopulation1 >= 0) break;
				}
			}
			if(currentPopulation1 < 0) return null;
		}
		previousTurn = turnOfAttack;
	}
	var _g = 0;
	while(_g < listResult.length) {
		var currentBackUp = listResult[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < candidatePlanets.length) {
			var currentOrder = candidatePlanets[_g1];
			++_g1;
			if(currentBackUp.planet.id == currentOrder.planet.id) currentOrder.addOrder(currentBackUp.turnToLaunch,planetToDefend.planet,currentBackUp.forceToSend);
		}
	}
	return listResult;
}
fr.roxor.tactics.GalacticSniff = function() { }
fr.roxor.tactics.GalacticSniff.__name__ = true;
fr.roxor.tactics.GalacticSniff.getNeutralPlanetsAttackedWithSucces = function(ennemyFleet,currentTurn,unnattackedPlanetByMe) {
	var listOfNeutralPlanetTaken = new Array();
	var _g = 0;
	while(_g < unnattackedPlanetByMe.length) {
		var currentNeutral = unnattackedPlanetByMe[_g];
		++_g;
		var totalEnnemyForceToPlanet = 0;
		var lastTurnOfAttack = currentTurn;
		var neutralPopulation = currentNeutral.population;
		var survivingEnnemyForces = 0;
		var _g1 = 0;
		while(_g1 < ennemyFleet.length) {
			var currentEnnemyShip = ennemyFleet[_g1];
			++_g1;
			if(currentEnnemyShip.target.id == currentNeutral.id && currentEnnemyShip.owner != currentNeutral.owner) {
				totalEnnemyForceToPlanet += currentEnnemyShip.crew;
				if(currentEnnemyShip.creationTurn + currentEnnemyShip.travelDuration > lastTurnOfAttack) lastTurnOfAttack = currentEnnemyShip.creationTurn + currentEnnemyShip.travelDuration;
			}
		}
		neutralPopulation = Math.min(neutralPopulation + (lastTurnOfAttack - currentTurn) * 5,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(currentNeutral.size)) | 0;
		survivingEnnemyForces = totalEnnemyForceToPlanet - neutralPopulation;
		if(survivingEnnemyForces > 0) {
			var neutralTaken = new fr.roxor.bean.NeutralTakenPlanet();
			neutralTaken.planet = currentNeutral;
			neutralTaken.survivngEnnemyForces = Math.min(survivingEnnemyForces,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(currentNeutral.size)) | 0;
			neutralTaken.turnTaken = lastTurnOfAttack;
			listOfNeutralPlanetTaken.push(neutralTaken);
		}
	}
	return listOfNeutralPlanetTaken;
}
fr.roxor.tactics.GalacticSniff.getAttackingPlanet = function(neutralTargetPlanet,myPlanets,currentTurn) {
	var listOfAttackingPlanet = new Array();
	var attackingPlanet = null;
	var turnToReach = 0;
	var attackPower = 0;
	var defensePower = neutralTargetPlanet.planet.population;
	var listToManipule = fr.roxor.bean.OrderPlanet.getlistPlanet(myPlanets);
	var delayForce = 0;
	var _g1 = 0, _g = myPlanets.length;
	while(_g1 < _g) {
		var i = _g1++;
		attackingPlanet = fr.roxor.util.PlanetUtil.getNearestPlanet(neutralTargetPlanet.planet,listToManipule);
		var attackingOrderPlanet = fr.roxor.bean.OrderPlanet.getNearestOrderPlanet(neutralTargetPlanet.planet,myPlanets,i);
		var travelTime = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackingPlanet,neutralTargetPlanet.planet);
		var turnToLeave = neutralTargetPlanet.turnTaken - (travelTime - 2);
		turnToReach = neutralTargetPlanet.turnTaken + 1;
		defensePower = Math.min(neutralTargetPlanet.survivngEnnemyForces + 10,com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(neutralTargetPlanet.planet.size)) | 0;
		var currentAvailableForce = attackingOrderPlanet.getPopulationAvailableForTurn(currentTurn);
		attackPower += currentAvailableForce;
		fr.roxor.util.DebugMessage.instance.addMessage("turnToReach : " + turnToReach);
		fr.roxor.util.DebugMessage.instance.addMessage("defensePower : " + defensePower);
		fr.roxor.util.DebugMessage.instance.addMessage("attackPower : " + attackPower);
		listOfAttackingPlanet.push(new fr.roxor.util.AttackingPlanet(attackingPlanet,currentAvailableForce,turnToLeave,turnToReach));
		HxOverrides.remove(listToManipule,attackingPlanet);
		if(attackPower + delayForce > defensePower) {
			var totalForce = attackPower + delayForce;
			var _g2 = 0, _g3 = listOfAttackingPlanet.slice();
			while(_g2 < _g3.length) {
				var currentAttackingPlanet = _g3[_g2];
				++_g2;
				var resteForce = totalForce - defensePower - 1;
				if(resteForce > currentAttackingPlanet.strikeForce) {
					HxOverrides.remove(listOfAttackingPlanet,currentAttackingPlanet);
					totalForce -= currentAttackingPlanet.strikeForce;
				} else {
					currentAttackingPlanet.strikeForce -= resteForce;
					break;
				}
			}
			break;
		} else if(myPlanets.length - 1 == i) return null;
	}
	var _g = 0;
	while(_g < listOfAttackingPlanet.length) {
		var currentAttacking = listOfAttackingPlanet[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < myPlanets.length) {
			var currentOrder = myPlanets[_g1];
			++_g1;
			if(currentAttacking.planet.id == currentOrder.planet.id) currentOrder.addOrder(currentAttacking.turnToStrike,neutralTargetPlanet.planet,currentAttacking.strikeForce);
		}
	}
	return listOfAttackingPlanet;
}
fr.roxor.util = {}
fr.roxor.util.AttackingPlanet = function(planet,strikeForce,turnToStrike,turnToReach,ableToStrikeAgain) {
	if(ableToStrikeAgain == null) ableToStrikeAgain = false;
	this.planet = planet;
	this.strikeForce = strikeForce;
	this.turnToStrike = turnToStrike;
	this.turnToReach = turnToReach;
	this.ableToStrikeAgain = ableToStrikeAgain;
};
fr.roxor.util.AttackingPlanet.__name__ = true;
fr.roxor.util.DebugMessage = function() {
};
fr.roxor.util.DebugMessage.__name__ = true;
fr.roxor.util.DebugMessage.prototype = {
	addMessage: function(message) {
		this.debugMessage += message + "<BR />";
	}
}
fr.roxor.util.Pair = function(key,value) {
	this.key = key;
	this.value = value;
};
fr.roxor.util.Pair.__name__ = true;
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
}
fr.roxor.util.PlanetUtil = function() { }
fr.roxor.util.PlanetUtil.__name__ = true;
fr.roxor.util.PlanetUtil.caulculDistances = function(galaxy) {
	var _g1 = 0, _g = galaxy.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var myPlanet = galaxy.content[i];
		var _g3 = 0, _g2 = galaxy.content.length;
		while(_g3 < _g2) {
			var j = _g3++;
			var myOtherPlanet = galaxy.content[j];
			if(myPlanet.id != myOtherPlanet.id) fr.roxor.util.PlanetUtil.distanceMap.set(myPlanet.id + ";" + myOtherPlanet.id,com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(myPlanet,myOtherPlanet));
		}
	}
}
fr.roxor.util.PlanetUtil.getNearestPlanet = function(source,candidats) {
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
fr.roxor.util.TargetPlanets = function() {
	this.mapOfTargets = new haxe.ds.ObjectMap();
};
fr.roxor.util.TargetPlanets.__name__ = true;
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,get: function(key) {
		return this.h[key];
	}
	,set: function(key,value) {
		this.h[key] = value;
	}
}
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe.ds.ObjectMap.__name__ = true;
haxe.ds.ObjectMap.__interfaces__ = [IMap];
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
String.__name__ = true;
Array.__name__ = true;
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
fr.roxor.util.DebugMessage.instance = new fr.roxor.util.DebugMessage();
fr.roxor.util.PlanetUtil.distanceMap = new haxe.ds.StringMap();
GalacticEmperorsIA.main();
})();
