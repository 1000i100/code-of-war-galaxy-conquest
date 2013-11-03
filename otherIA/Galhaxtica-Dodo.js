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
var Lambda = function() { }
Lambda.__name__ = true;
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
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
	this.letOtherAttackFirst = true;
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
	,addFakeOrder: function(source,target,crew) {
		if(target == null || source == null || source.owner.id != this.id) return 0; else {
			var offset = this.alreadyUsedCrew.exists(source.id)?this.alreadyUsedCrew.get(source.id):0;
			var maxCrew = Math.floor(Math.min(source.population - offset,crew));
			this.alreadyUsedCrew.set(source.id,maxCrew + offset);
			if(maxCrew > 0) {
				MyIA.nbIdleTurn.set(source.id,0);
				return maxCrew;
			} else return 0;
		}
	}
	,addOrder: function(source,target,crew) {
		if(target == null || source == null || source.owner.id != this.id) return 0; else {
			var offset = this.alreadyUsedCrew.exists(source.id)?this.alreadyUsedCrew.get(source.id):0;
			var maxCrew = Math.floor(Math.min(source.population - offset,crew));
			this.alreadyUsedCrew.set(source.id,maxCrew + offset);
			if(maxCrew > 0) {
				MyIA.nbIdleTurn.set(source.id,0);
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
		var crew = this.getAbsoluteCrew(target,null);
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
		if(hasChanged && minTurn < this.numTurn) {
			crew -= totalShip;
			crew += (this.numTurn - minTurn) * 5 * (crew > 0?1:-1);
		} else if(hasChanged) crew += totalShip - (minTurn - this.numTurn) * 5;
		if(this.mexicanStandoff) return com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size) + 1; else return crew + 15;
	}
	,getBestTarget: function() {
		if(this.lastBestTarget == null) this.lastBestTarget = this.getWeakestPlanet(this.enemyPlanets);
		if(this.mexicanStandoff && this.lastBestTarget != null) return this.lastBestTarget;
		var minFitness = Math.POSITIVE_INFINITY;
		var planetToIntercept = null;
		var minPop = Math.POSITIVE_INFINITY;
		var _g = 0, _g1 = this.neutralPlanets;
		while(_g < _g1.length) {
			var planet = _g1[_g];
			++_g;
			var pop = planet.population;
			var turnsLeft = -1;
			var ships = this.getFleetTo(planet,this.id);
			var $it0 = ships.iterator();
			while( $it0.hasNext() ) {
				var f = $it0.next();
				pop -= f.crew;
				if(pop < 0) {
					turnsLeft = f.creationTurn - this.numTurn + f.travelDuration;
					break;
				}
			}
			if(turnsLeft > 0 && pop < 0) {
				var myPop = 0;
				var _g2 = 0, _g3 = this.myPlanets;
				while(_g2 < _g3.length) {
					var myp = _g3[_g2];
					++_g2;
					if(com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(myp,planet) < turnsLeft) myPop += Math.floor(myp.population);
				}
				if(myPop > -pop && minPop > -pop) {
					planetToIntercept = planet;
					minPop = -pop;
					this.debugMessage += "interception " + myPop + "->" + pop + "<br>";
				}
			}
		}
		if(planetToIntercept != null) return planetToIntercept;
		var _g = 0, _g1 = this.otherPlanets;
		while(_g < _g1.length) {
			var planet = _g1[_g];
			++_g;
			var updatedPlanet = new com.tamina.planetwars.data.Planet(planet.x,planet.y,planet.size,planet.owner);
			updatedPlanet.population = planet.population;
			updatedPlanet.id = planet.id;
			var _g2 = 0, _g3 = this.orders;
			while(_g2 < _g3.length) {
				var o = _g3[_g2];
				++_g2;
				if(o.targetID == updatedPlanet.id) updatedPlanet.population -= o.numUnits;
			}
			var fit = updatedPlanet.population * 3.1 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(updatedPlanet.x,updatedPlanet.y)) * 3 + 600 / updatedPlanet.size + (updatedPlanet.owner.name == "neutre"?700:0);
			var maxEta = 0;
			var $it1 = this.getFleetTo(updatedPlanet,this.enemyId).iterator();
			while( $it1.hasNext() ) {
				var ship = $it1.next();
				updatedPlanet.population -= ship.crew;
				var eta = ship.creationTurn - this.numTurn + ship.travelDuration;
				if(eta > maxEta) maxEta = eta;
			}
			if(fit < minFitness && updatedPlanet.population > 0) {
				minFitness = fit;
				this.bestTarget = planet;
			}
		}
		return this.bestTarget;
	}
	,getAbsoluteCrew: function(target,startPoint) {
		var origin = startPoint != null?startPoint:this.getGravityCenter();
		var numTurn = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(origin,new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
		return target.population + numTurn * 5;
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
			if(ship.target.id == planet.id) result.head = new haxe.ds.GenericCell(ship,result.head);
		}
		return result;
	}
	,getFitness: function(source,target) {
		return target.population * 3.1 + com.tamina.planetwars.utils.GameUtil.getDistanceBetween(this.getGravityCenter(),new com.tamina.planetwars.geom.Point(target.x,target.y)) * 3 + 600 / target.size + (target.owner.name == "neutre"?700:0);
	}
	,getWeakestPlanet: function(candidats) {
		var minPop = 301;
		var result = null;
		var $it0 = $iterator(candidats)();
		while( $it0.hasNext() ) {
			var planet = $it0.next();
			var pop = 0;
			var $it1 = this.getFleetTo(planet,this.enemyId).iterator();
			while( $it1.hasNext() ) {
				var ship = $it1.next();
				pop += ship.crew;
			}
			if(planet.population - pop < minPop) {
				minPop = planet.population - pop;
				result = planet;
			}
		}
		if(result == null) this.debugMessage += "OMGNONONONONONONONO!!!! <br>";
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
			var diff = attackedPlanet.population + minTurn * 5 + totalDefend - totalShip - 10;
			var helpCandidate = this.myPlanets.slice();
			HxOverrides.remove(helpCandidate,attackedPlanet);
			var order = new Array();
			var sendOrder = true;
			if(totalShip > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(attackedPlanet.size)) sendOrder = false;
			while(diff < 0 && helpCandidate.length > 0 && sendOrder) {
				var help = null;
				while(helpCandidate.length > 0 && help == null) {
					var candidate = this.getNearestPlanet(attackedPlanet,helpCandidate);
					HxOverrides.remove(helpCandidate,candidate);
					if(this.getFleetTo(candidate,this.id).head == null) help = candidate;
				}
				if(help != null) {
					var helpingCrew = 0;
					if(com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackedPlanet,help) - minTurn > -3) helpingCrew = -diff; else if(com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackedPlanet,help) > minTurn) helpingCrew = -diff + (com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(attackedPlanet,help) - minTurn) * 5;
					diff += this.addFakeOrder(help,attackedPlanet,helpingCrew);
					order.push({ source : help, target : attackedPlanet, population : helpingCrew});
				} else {
					diff = 1;
					sendOrder = false;
				}
			}
			if(sendOrder) {
				var _g = 0;
				while(_g < order.length) {
					var o = order[_g];
					++_g;
					this.addOrder(o.source,o.target,o.population);
				}
			} else {
				this.debugMessage += "FUYONS !";
				this.addOrder(attackedPlanet,this.getBestTarget(),attackedPlanet.population);
			}
		}
	}
	,getOrders: function(context) {
		this.debugMessage = "tour " + this.numTurn + "\n";
		this.galaxy = context;
		this.orders = new Array();
		this.alreadyUsedCrew = new haxe.ds.StringMap();
		this.myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(this.id,context);
		this.otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets(this.id,context);
		this.enemyPlanets = Utils.getEnnemyPlayerPlanets(this.id,context);
		if(this.enemyPlanets.length > 0) this.enemyId = this.enemyPlanets[0].owner.id;
		this.neutralPlanets = Utils.getNeutralPlanets(this.id,context);
		var myGloriousPop = 0;
		var peasants = 0;
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			myGloriousPop += p.population;
		}
		var _g = 0, _g1 = this.enemyPlanets;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			peasants += p.population;
		}
		var _g = 0, _g1 = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,this.galaxy);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			peasants += f.crew;
		}
		var _g = 0, _g1 = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.enemyId,this.galaxy);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			myGloriousPop += f.crew;
		}
		this.popInferiority = myGloriousPop < peasants;
		this.inferiority = this.myPlanets.length < this.enemyPlanets.length;
		if(myGloriousPop - peasants == this.deltaPop) this.mexicanStandoffCount++; else this.mexicanStandoffCount = 0;
		this.deltaPop = myGloriousPop - peasants;
		this.mexicanStandoff = this.mexicanStandoffCount >= 10;
		if(this.mexicanStandoff) this.debugMessage += "HOLA CABRON!!!";
		var target = this.getBestTarget();
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var planet = _g1[_g];
			++_g;
			var idleTurn = 0;
			if(MyIA.nbIdleTurn.exists(planet.id)) idleTurn = MyIA.nbIdleTurn.get(planet.id);
			MyIA.nbIdleTurn.set(planet.id,idleTurn + 1);
			this.help(planet);
			if(planet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size)) this.addOrder(planet,this.getBestTarget(),10);
		}
		if(this.enemyPlanets.length > 1 && this.enemyPlanets[0].population < 10 && this.myPlanets.length > 0 && this.numTurn % 10 == 0) {
			var nearest = this.getNearestPlanet(this.enemyPlanets[0],this.myPlanets);
			if(nearest.population > 20 && this.getFleetTo(nearest,this.id).head == null) this.addOrder(nearest,this.enemyPlanets[0],10);
		}
		var hasJustSent = false;
		if(com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,this.galaxy).length > 0) {
			this.letOtherAttackFirst = false;
			hasJustSent = true;
		}
		if(this.letOtherAttackFirst) {
			this.debugMessage += "Your move<br>";
			return this.orders;
		} else {
			var enemyShips = com.tamina.planetwars.utils.GameUtil.getEnnemyFleet(this.id,context);
			if(this.bestTarget != null) {
				var crewNeeded = this.getRequiredCrew(this.getBestTarget());
				var attackers = new Array();
				var _g = 0, _g1 = this.myPlanets;
				while(_g < _g1.length) {
					var planet = _g1[_g];
					++_g;
					var fleet = this.getFleetTo(planet,this.id);
					if(fleet.head == null) attackers.push(planet); else if(MyIA.nbIdleTurn.get(planet.id) > 50 && planet.population > (fleet.head == null?null:fleet.head.elt).crew && this.popInferiority) {
						var attackingPlanets = new haxe.ds.GenericStack();
						this.debugMessage += "temps d'idle trop long <br>";
						var $it0 = fleet.iterator();
						while( $it0.hasNext() ) {
							var ship = $it0.next();
							if(!Lambda.has(attackingPlanets,ship.source)) attackingPlanets.head = new haxe.ds.GenericCell(ship.source,attackingPlanets.head);
						}
						var target1 = this.getWeakestPlanet(attackingPlanets);
						this.addOrder(planet,target1,this.getAbsoluteCrew(target1,new com.tamina.planetwars.geom.Point(planet.x,planet.y)) + 1);
					}
				}
				if(this.myPlanets.length > 2 && HxOverrides.remove(attackers,this.myPlanets[0]) && this.myPlanets[0].population >= 10) this.addOrder(this.myPlanets[0],this.getNearestPlanet(this.myPlanets[0],this.galaxy.content),this.myPlanets[0].population - 10);
				var _g = 0;
				while(_g < attackers.length) {
					var myPlanet = attackers[_g];
					++_g;
					var optimalCrew = Math.ceil(this.getDistanceBetweenPlanet(myPlanet,this.getBestTarget()) * crewNeeded / this.getSumDistanceTo(this.getBestTarget(),attackers));
					if(optimalCrew <= myPlanet.population) this.addOrder(myPlanet,this.getBestTarget(),optimalCrew);
				}
			} else this.debugMessage += "bestTarget est null <br>";
		}
		this.numTurn++;
		this.lastBestTarget = this.bestTarget;
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
		if(p.owner.id != planetOwnerId && !(p.owner.name == "neutre")) result.push(p);
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
Utils.toPoint = function(planet) {
	return new com.tamina.planetwars.geom.Point(planet.x,planet.y);
}
Utils.isFull = function(planet) {
	return planet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size);
}
Utils.isNeutral = function(planet) {
	return planet.owner.name == "neutre";
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
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
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
MyIA.AGRESSIVE = true;
MyIA.INTERCEPTOR = true;
MyIA.MEXICANSTANDOFFTRESHOLD = 10;
MyIA.nbIdleTurn = new haxe.ds.StringMap();
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
MyIA.main();
})();
