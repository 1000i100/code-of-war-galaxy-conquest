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
var MyIA = function() {
	WorkerIA.call(this,"Stellea#1",8447);
	this.strat = this.strategy();
};
MyIA.__name__ = true;
MyIA.main = function() {
	WorkerIA.instance = new MyIA();
}
MyIA.__super__ = WorkerIA;
MyIA.prototype = $extend(WorkerIA.prototype,{
	getOrders: function(context) {
		return this.strat.getOrders(context,this.id);
	}
	,strategy: function() {
		return new strategy.Expand();
	}
});
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
com.tamina.planetwars.data.Planet.prototype = {
	toString: function() {
		var str = "Hello boys";
		return str;
	}
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
com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets = function(p1,p2) {
	return com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(p1.x,p1.y),new com.tamina.planetwars.geom.Point(p2.x,p2.y));
}
com.tamina.planetwars.utils.GameUtil.getTravelNumTurn = function(source,target) {
	return Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
}
com.tamina.planetwars.utils.GameUtil.getPlayerPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g = 0, _g1 = context.content;
	while(_g < _g1.length) {
		var planet = _g1[_g];
		++_g;
		if(planet.owner.id == planetOwnerId) result.push(planet);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getEnemyPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g = 0, _g1 = context.content;
	while(_g < _g1.length) {
		var planet = _g1[_g];
		++_g;
		if(planet.owner.id != planetOwnerId) result.push(planet);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getPlayerShips = function(playerId,context) {
	var result = new Array();
	var _g = 0, _g1 = context.fleet;
	while(_g < _g1.length) {
		var ship = _g1[_g];
		++_g;
		if(ship.owner.id == playerId) result.push(ship);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getEnemyShips = function(playerId,context) {
	var result = new Array();
	var _g = 0, _g1 = context.fleet;
	while(_g < _g1.length) {
		var ship = _g1[_g];
		++_g;
		if(ship.owner.id != playerId) result.push(ship);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getNearestPlanet = function(source,candidats) {
	var result = candidats[0];
	var currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(source,result);
	var _g1 = 0, _g = candidats.length;
	while(_g1 < _g) {
		var i = _g1++;
		var element = candidats[i];
		if(currentDist > com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(source,element)) {
			currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(source,element);
			result = element;
		}
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getEnnemyName = function(others) {
	var first = others[0].owner;
	var second = others[1].owner;
	return first == others[others.length - 1].owner?second:first;
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
var strategy = {}
strategy.Strategy = function() { }
strategy.Strategy.__name__ = true;
strategy.Expand = function(distance,marge,level) {
	if(level == null) level = 10;
	if(marge == null) marge = 0.5;
	if(distance == null) distance = 0.5;
	this.distance = distance;
	this.marge = marge;
	this.level = level;
};
strategy.Expand.__name__ = true;
strategy.Expand.__interfaces__ = [strategy.Strategy];
strategy.Expand.prototype = {
	getPlanetsAround: function(source,distance,marge,candidats) {
		var result = new Array();
		var _g = 0;
		while(_g < candidats.length) {
			var planet = candidats[_g];
			++_g;
			if(com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(source,planet) >= distance - marge && com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(source,planet) <= distance + marge) result.push(planet);
		}
		return result;
	}
	,getOrders: function(context,id) {
		var result = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnemyPlanets(id,context);
		if(otherPlanets != null && otherPlanets.length > 0) {
			var _g = 0;
			while(_g < myPlanets.length) {
				var myPlanet = [myPlanets[_g]];
				++_g;
				otherPlanets.sort((function(myPlanet) {
					return function(a,b) {
						return com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(a,myPlanet[0]) - com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(b,myPlanet[0]) | 0;
					};
				})(myPlanet));
				var planetsAround = [];
				var acc = 0;
				while(planetsAround.length == 0) {
					planetsAround = this.getPlanetsAround(myPlanet[0],this.distance + acc,this.marge,otherPlanets);
					acc++;
				}
				var quant = new Array();
				var sum = 0;
				var dbgstr = "";
				var _g1 = 0;
				while(_g1 < planetsAround.length) {
					var planet = planetsAround[_g1];
					++_g1;
					sum += planet.size;
					dbgstr += planet.toString() + "\n";
				}
				if(myPlanet[0].population >= this.level) {
					var _g2 = 0, _g1 = planetsAround.length;
					while(_g2 < _g1) {
						var i = _g2++;
						result.push(new com.tamina.planetwars.data.Order(myPlanet[0].id,planetsAround[i].id,Math.floor(myPlanet[0].population / sum * planetsAround[i].size)));
					}
				}
			}
		}
		return result;
	}
}
strategy.Germany = function(level,quant) {
	if(quant == null) quant = 40;
	if(level == null) level = 50;
	this.level = level;
	this.quant = quant;
};
strategy.Germany.__name__ = true;
strategy.Germany.__interfaces__ = [strategy.Strategy];
strategy.Germany.prototype = {
	getOrders: function(context,id) {
		var result = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnemyPlanets(id,context);
		if(otherPlanets != null && otherPlanets.length > 0) {
			var _g = 0;
			while(_g < myPlanets.length) {
				var myPlanet = myPlanets[_g];
				++_g;
				var target = com.tamina.planetwars.utils.GameUtil.getNearestPlanet(myPlanet,otherPlanets);
				if(myPlanet.population >= this.level) result.push(new com.tamina.planetwars.data.Order(myPlanet.id,target.id,this.quant));
			}
		}
		return result;
	}
}
strategy.Spread = function(ia) {
	this.ia = ia;
};
strategy.Spread.__name__ = true;
strategy.Spread.__interfaces__ = [strategy.Strategy];
strategy.Spread.prototype = {
	newOrder: function(source,target,population) {
		if(source.population >= population) return new com.tamina.planetwars.data.Order(source.id,target.id,population);
		return null;
	}
	,getOrders: function(context,id) {
		var orders = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
		var myShips = com.tamina.planetwars.utils.GameUtil.getPlayerShips(id,context);
		var enemyPlanets = com.tamina.planetwars.utils.GameUtil.getEnemyPlanets(id,context);
		var enemyShips = com.tamina.planetwars.utils.GameUtil.getEnemyShips(id,context);
		var totalPopulation = 0;
		var _g = 0;
		while(_g < myPlanets.length) {
			var planet = myPlanets[_g];
			++_g;
			totalPopulation += planet.population;
		}
		var _g = 0;
		while(_g < myPlanets.length) {
			var source = [myPlanets[_g]];
			++_g;
			if(source[0].population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(source[0].size)) {
				enemyPlanets.sort((function(source) {
					return function(a,b) {
						return com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(a,source[0]) - com.tamina.planetwars.utils.GameUtil.getDistanceBetweenPlanets(b,source[0]) | 0;
					};
				})(source));
				var _g1 = 0;
				while(_g1 < enemyPlanets.length) {
					var target = enemyPlanets[_g1];
					++_g1;
					var populationByLanding = target.population + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(source[0],target) * 5;
					if(source[0].population > populationByLanding) {
						var order = this.newOrder(source[0],target,populationByLanding + 1);
						if(order != null) orders.push(order);
					}
				}
			}
		}
		return orders;
	}
}
strategy.StraightToCore = function(percentage) {
	if(percentage == null) percentage = 100;
	this.percent = percentage;
};
strategy.StraightToCore.__name__ = true;
strategy.StraightToCore.__interfaces__ = [strategy.Strategy];
strategy.StraightToCore.prototype = {
	getOrders: function(context,id) {
		var result = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnemyPlanets(id,context);
		if(this.ennemy == null) this.ennemy = com.tamina.planetwars.utils.GameUtil.getEnnemyName(otherPlanets);
		var ennemyPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(this.ennemy.id,context);
		if(ennemyPlanets != null && ennemyPlanets.length > 0) {
			var _g = 0;
			while(_g < myPlanets.length) {
				var myPlanet = myPlanets[_g];
				++_g;
				var pop = Math.ceil(myPlanet.population * this.percent / 100);
				result.push(new com.tamina.planetwars.data.Order(myPlanet.id,ennemyPlanets[0].id,pop));
			}
		}
		return result;
	}
}
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
MyIA.main();
})();
