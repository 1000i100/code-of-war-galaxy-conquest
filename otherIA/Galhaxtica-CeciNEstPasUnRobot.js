(function () { "use strict";
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
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
var MyIA = function(name,color) {
	this.numTurn = 0;
	WorkerIA.call(this,name,color);
};
MyIA.__name__ = true;
MyIA.main = function() {
	WorkerIA.instance = new MyIA();
}
MyIA.__super__ = WorkerIA;
MyIA.prototype = $extend(WorkerIA.prototype,{
	getETA: function(ship) {
		return ship.creationTurn - this.numTurn + ship.travelDuration;
	}
	,addOrder: function(source,target,crew) {
		if(target == null) {
			this.debugMessage += "Targeting null with planet " + source.id;
			return 0;
		} else {
			var offset = this.alreadyUsedCrew.h.hasOwnProperty(source.__id__)?this.alreadyUsedCrew.h[source.__id__]:0;
			var maxCrew = Math.floor(Math.min(source.population - offset,crew));
			this.alreadyUsedCrew.set(source,maxCrew);
			if(maxCrew > 0) {
				this.orders.push(new com.tamina.planetwars.data.Order(source.id,target.id,maxCrew));
				return maxCrew;
			} else return 0;
		}
	}
	,getSumDistanceTo: function(p1,otherPlanets) {
		var total = 0;
		var $it0 = $iterator(otherPlanets)();
		while( $it0.hasNext() ) {
			var planet = $it0.next();
			total += com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(planet.x,planet.y),new com.tamina.planetwars.geom.Point(p1.x,p1.y));
		}
		return total;
	}
	,getDistanceBetweenPlanet: function(p1,p2) {
		return com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(p1.x,p1.y),new com.tamina.planetwars.geom.Point(p2.x,p2.y));
	}
	,getGravityCenter: function() {
		var averageX = 0;
		var averageY = 0;
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var planet = _g1[_g];
			++_g;
			averageX += planet.x;
			averageY += planet.y;
		}
		return new com.tamina.planetwars.geom.Point(averageX / this.myPlanets.length,averageY / this.myPlanets.length);
	}
	,getRequiredCrew: function(target) {
		var numTurn = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
		var crew = target.population + numTurn * 5;
		var totalShip = 0;
		var minTurn = Math.floor(Math.POSITIVE_INFINITY);
		var hasChanged = false;
		var $it0 = this.getFleetTo(target,this.id).iterator();
		while( $it0.hasNext() ) {
			var ship = $it0.next();
			totalShip += ship.crew;
			var eta = ship.creationTurn - this.numTurn + ship.travelDuration;
			if(eta > 0 && eta < minTurn) {
				minTurn = eta;
				hasChanged = true;
			}
		}
		if(hasChanged && minTurn < numTurn) {
			crew -= totalShip;
			crew += (numTurn - minTurn) * 5 * (crew > 0?1:-1);
		} else if(hasChanged) crew += totalShip - (minTurn - numTurn) * 5;
		return crew + 10;
	}
	,getMaxPossibleCrew: function(planet,objectif,populationOffset) {
		if(populationOffset == null) populationOffset = 0;
		return Math.floor(Math.min(planet.population - populationOffset,objectif));
	}
	,getFleetTo: function(planet,nonOwnerId) {
		var result = new haxe.ds.GenericStack();
		var ownFleet = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(nonOwnerId,this.galaxy);
		var _g = 0;
		while(_g < ownFleet.length) {
			var ship = ownFleet[_g];
			++_g;
			if(ship.target == planet) result.head = new haxe.ds.GenericCell(ship,result.head);
		}
		return result;
	}
	,getFitness: function(source,target) {
		if(this.enemyPlanets.length > 1) return target.population * 3 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(target.x,target.y)) * 2.5 + 300 / target.size + (target.owner.name == "neutral"?700:0); else return target.population * 2.5 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(target.x,target.y)) * 3 + 100 / target.size + (target.owner.name == "neutral"?0:10000);
	}
	,getWeakestPlanet: function(candidats) {
		var minPop = 301;
		var result = null;
		var $it0 = $iterator(candidats)();
		while( $it0.hasNext() ) {
			var planet = $it0.next();
			if(planet.population / com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size) < minPop) {
				minPop = planet.population;
				result = planet;
			}
		}
		return result;
	}
	,getFarestPlanet: function(source,candidats) {
		var result = null;
		var currentDist = 0;
		var $it0 = $iterator(candidats)();
		while( $it0.hasNext() ) {
			var planet = $it0.next();
			var distance = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(planet.x,planet.y));
			if(currentDist < distance && source != planet) {
				currentDist = distance;
				result = planet;
			}
		}
		return result;
	}
	,getNearestPlanet: function(source,candidats) {
		var result = null;
		var currentDist = Math.POSITIVE_INFINITY;
		var $it0 = $iterator(candidats)();
		while( $it0.hasNext() ) {
			var planet = $it0.next();
			var distance = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(planet.x,planet.y));
			if(currentDist > distance && source != planet) {
				currentDist = distance;
				result = planet;
			}
		}
		return result;
	}
	,help: function(attackedPlanet) {
		var minTurn = Math.round(Math.POSITIVE_INFINITY);
		var totalShip = 0;
		var hasChanged = false;
		var attackingFleet = this.getFleetTo(attackedPlanet,this.id);
		var defendingFleet = this.getFleetTo(attackedPlanet,this.enemyId);
		var totalDefend = 0;
		var $it0 = attackingFleet.iterator();
		while( $it0.hasNext() ) {
			var ship = $it0.next();
			totalShip += ship.crew;
			var eta = ship.creationTurn - this.numTurn + ship.travelDuration;
			if(eta > 0 && eta < minTurn) {
				minTurn = eta;
				hasChanged = true;
			}
		}
		var $it1 = defendingFleet.iterator();
		while( $it1.hasNext() ) {
			var ship = $it1.next();
			totalDefend += ship.crew;
		}
		if(!(attackingFleet.head == null) && hasChanged) {
			var diff = attackedPlanet.population + minTurn * 5 + totalDefend - totalShip - 20;
			var helpCandidate = this.myPlanets.slice();
			while(diff < 0 && helpCandidate.length > 0) {
				var help = null;
				var i = 5;
				while(helpCandidate.length > 0 && help == null) {
					var candidate = this.getNearestPlanet(attackedPlanet,helpCandidate);
					HxOverrides.remove(helpCandidate,candidate);
					if(this.getFleetTo(candidate,this.id).head == null) help = candidate;
				}
				if(help != null) {
					var helpingCrew = 0;
					if(com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackedPlanet,help) <= minTurn) helpingCrew = -diff; else helpingCrew = -diff + (com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackedPlanet,help) - minTurn) * 5;
					diff += this.addOrder(help,attackedPlanet,helpingCrew);
				} else diff = -1;
			}
		}
	}
	,getOrders: function(context) {
		var _g = this;
		this.debugMessage = "";
		this.galaxy = context;
		this.orders = new Array();
		this.alreadyUsedCrew = new haxe.ds.ObjectMap();
		this.myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(this.id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets(this.id,context);
		this.enemyPlanets = Utils.getEnnemyPlayerPlanets(this.id,context);
		if(this.enemyPlanets.length > 0) this.enemyId = this.enemyPlanets[0].owner.id;
		this.neutralPlanets = Utils.getNeutralPlanets(this.id,context);
		var isInSuperiorForce;
		var minFitness = Math.POSITIVE_INFINITY;
		var bestTarget = null;
		var _g1 = 0;
		while(_g1 < otherPlanets.length) {
			var planet = otherPlanets[_g1];
			++_g1;
			var fit = this.enemyPlanets.length > 1?planet.population * 3 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(planet.x,planet.y)) * 2.5 + 300 / planet.size + (planet.owner.name == "neutral"?700:0):planet.population * 2.5 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(planet.x,planet.y)) * 3 + 100 / planet.size + (planet.owner.name == "neutral"?0:10000);
			var totalShip = 0;
			var maxEta = 0;
			var $it0 = this.getFleetTo(planet,this.enemyId).iterator();
			while( $it0.hasNext() ) {
				var ship = $it0.next();
				totalShip += ship.crew;
				var eta = ship.creationTurn - this.numTurn + ship.travelDuration;
				if(eta > maxEta) maxEta = eta;
			}
			if(fit < minFitness && totalShip < planet.population + maxEta * 5 && planet != this.enemyPlanets[0]) {
				minFitness = fit;
				bestTarget = planet;
			}
		}
		var _g1 = 0, _g11 = this.myPlanets;
		while(_g1 < _g11.length) {
			var planet = _g11[_g1];
			++_g1;
			this.help(planet);
		}
		if(this.numTurn == 0) {
			otherPlanets.sort(function(p1,p2) {
				if(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(_g.myPlanets[0].x,_g.myPlanets[0].y),new com.tamina.planetwars.geom.Point(p1.x,p1.y)) > com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(_g.myPlanets[0].x,_g.myPlanets[0].y),new com.tamina.planetwars.geom.Point(p2.x,p2.y))) return 1; else return -1;
			});
			var availablePop = this.myPlanets[0].population;
			var i = 0;
			while(availablePop > 0 && i < otherPlanets.length) {
				var popNeeded = otherPlanets[i].population + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(this.myPlanets[0],otherPlanets[i]) * 5 + 5;
				if(popNeeded < availablePop) {
					this.addOrder(this.myPlanets[0],otherPlanets[i],popNeeded);
					availablePop -= popNeeded;
					this.lastTarget = otherPlanets[i];
				}
				i++;
			}
		} else if(bestTarget == null || this.enemyPlanets.length == 1 && this.neutralPlanets.length == 0) {
			var completes = new haxe.ds.GenericStack();
			var notCompletes = new haxe.ds.GenericStack();
			var numComplete = 0;
			var _g1 = 0, _g11 = this.myPlanets;
			while(_g1 < _g11.length) {
				var myPlanet = _g11[_g1];
				++_g1;
				if(myPlanet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myPlanet.size)) {
					completes.head = new haxe.ds.GenericCell(myPlanet,completes.head);
					numComplete++;
				} else notCompletes.head = new haxe.ds.GenericCell(myPlanet,notCompletes.head);
			}
			var totalPop = 0;
			var maxPop = 0;
			var _g1 = 0, _g11 = this.myPlanets;
			while(_g1 < _g11.length) {
				var p = _g11[_g1];
				++_g1;
				totalPop += p.population;
				maxPop += com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(p.size);
			}
			if(totalPop / maxPop >= 0.99) {
				var _g1 = 0, _g11 = this.myPlanets;
				while(_g1 < _g11.length) {
					var myPlanet = _g11[_g1];
					++_g1;
					var fleet = this.getFleetTo(myPlanet,this.id);
					if(fleet.head == null && this.enemyPlanets.length > 0) this.addOrder(myPlanet,this.enemyPlanets[0],Math.ceil(myPlanet.population / 2)); else if(Utils.isFull(myPlanet) && this.enemyPlanets.length > 0) {
						var totalShip = 0;
						var $it1 = fleet.iterator();
						while( $it1.hasNext() ) {
							var ship = $it1.next();
							totalShip += ship.crew;
						}
						this.addOrder(myPlanet,this.enemyPlanets[0],myPlanet.population - totalShip);
					}
				}
			} else {
				this.alreadySendCrew = new haxe.ds.ObjectMap();
				var tmpPlanet = this.myPlanets.slice();
				var $it2 = completes.iterator();
				while( $it2.hasNext() ) {
					var planet = $it2.next();
					var target = null;
					var totalShip = 0;
					while(target == null && tmpPlanet.length > 0) {
						target = this.getWeakestPlanet(tmpPlanet);
						var fleet = this.getFleetTo(target,this.enemyId);
						var lastShip = null;
						var greaterDistance = 0;
						var $it3 = fleet.iterator();
						while( $it3.hasNext() ) {
							var ship = $it3.next();
							totalShip += ship.crew;
							var eta = ship.creationTurn - this.numTurn + ship.travelDuration;
							if(greaterDistance < eta) {
								lastShip = ship;
								greaterDistance = eta;
							}
						}
						var alreadySent;
						if(this.alreadySendCrew.h.hasOwnProperty(target.__id__)) alreadySent = this.alreadySendCrew.h[target.__id__]; else alreadySent = 0;
						if(totalShip + target.population + alreadySent + 5 * (lastShip != null?greaterDistance:1) + 10 >= com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size)) {
							HxOverrides.remove(tmpPlanet,target);
							target = null;
						}
					}
					if(target != null) {
						this.addOrder(planet,target,5);
						if(!this.alreadySendCrew.h.hasOwnProperty(target.__id__)) this.alreadySendCrew.set(target,0);
						this.alreadySendCrew.set(target,this.alreadySendCrew.h[target.__id__] + 5);
					} else this.addOrder(planet,this.enemyPlanets[0],5);
				}
				if(this.enemyPlanets.length > 0) {
					var nearest = this.getNearestPlanet(this.enemyPlanets[0],this.myPlanets);
					if(nearest.population > 49) this.addOrder(nearest,this.enemyPlanets[0],5);
				}
			}
		} else if(otherPlanets != null && otherPlanets.length > 0) {
			var enemyShips = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,context);
			if(bestTarget != null) {
				var crewNeeded = this.getRequiredCrew(bestTarget);
				var attackers = new Array();
				var _g1 = 0, _g11 = this.myPlanets;
				while(_g1 < _g11.length) {
					var planet = _g11[_g1];
					++_g1;
					var fleet = this.getFleetTo(planet,this.id);
					if(fleet.head == null) attackers.push(planet); else if(planet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size)) this.addOrder(planet,bestTarget,5);
				}
				this.lastTarget = bestTarget;
				var _g1 = 0;
				while(_g1 < attackers.length) {
					var myPlanet = attackers[_g1];
					++_g1;
					var optimalCrew = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(myPlanet.x,myPlanet.y),new com.tamina.planetwars.geom.Point(bestTarget.x,bestTarget.y)) * crewNeeded / this.getSumDistanceTo(bestTarget,attackers));
					if(optimalCrew <= myPlanet.population) this.addOrder(myPlanet,bestTarget,optimalCrew);
				}
			}
		}
		this.numTurn++;
		return this.orders;
	}
	,__class__: MyIA
});
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
var Utils = function() { }
Utils.__name__ = true;
Utils.getEnnemyPlayerPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id != planetOwnerId && p.owner.name != "neutre") result.push(p);
	}
	return result;
}
Utils.getNeutralPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id != planetOwnerId && p.owner.name == "neutre") result.push(p);
	}
	return result;
}
Utils.getPlayerForce = function(playerId,context) {
	var result = 0;
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id == playerId) result += p.population;
	}
	var _g1 = 0, _g = context.fleet.length;
	while(_g1 < _g) {
		var i = _g1++;
		var s = context.fleet[i];
		if(s.owner.id == playerId) result += s.crew;
	}
	return result;
}
Utils.isFull = function(planet) {
	return planet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size);
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
var haxe = {}
haxe.ds = {}
haxe.ds.GenericCell = function(elt,next) {
	this.elt = elt;
	this.next = next;
};
haxe.ds.GenericCell.__name__ = true;
haxe.ds.GenericCell.prototype = {
	__class__: haxe.ds.GenericCell
}
haxe.ds.GenericStack = function() {
};
haxe.ds.GenericStack.__name__ = true;
haxe.ds.GenericStack.prototype = {
	iterator: function() {
		var l = this.head;
		return { hasNext : function() {
			return l != null;
		}, next : function() {
			var k = l;
			l = k.next;
			return k.elt;
		}};
	}
	,__class__: haxe.ds.GenericStack
}
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe.ds.ObjectMap.__name__ = true;
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ != null?key.__id__:key.__id__ = ++haxe.ds.ObjectMap.count;
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,__class__: haxe.ds.ObjectMap
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
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
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
onmessage = WorkerIA.prototype.messageHandler;
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
MyIA.AGRESSIVE = false;
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
haxe.ds.ObjectMap.count = 0;
MyIA.main();
})();
