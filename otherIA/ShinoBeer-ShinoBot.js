(function () { "use strict";
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
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
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
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
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	__class__: haxe.ds.IntMap
}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,exists: function(key) {
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
var shinobeer = {}
shinobeer.ShinoBase = function(name,color) {
	WorkerIA.call(this,name,color);
};
shinobeer.ShinoBase.__name__ = true;
shinobeer.ShinoBase.__super__ = WorkerIA;
shinobeer.ShinoBase.prototype = $extend(WorkerIA.prototype,{
	updateShip: function(context) {
		var $it0 = this.planetes.iterator();
		while( $it0.hasNext() ) {
			var p = $it0.next();
			p.vaisseauAttaque = new Array();
		}
		var _g = 0, _g1 = context.fleet;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			this.planetes.get(s.target.id).addShip(s);
			if(shinobeer.utils.ShinoUtil.enemy(s.owner.id) && s.creationTurn == this.numTour - 1) this.shipsOnTurn.push(s);
		}
		var $it1 = this.planetes.iterator();
		while( $it1.hasNext() ) {
			var p = $it1.next();
			p.computeShips(this.numTour);
		}
	}
	,updatePlanetes: function(context) {
		this.myPlanets = new Array();
		this.neutrePlanets = new Array();
		this.enemyPlanets = new Array();
		this.noMyPlanets = new Array();
		var enemyPlanet = false;
		var _g = 0, _g1 = context.content;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			this.planetes.get(p.id).setDebutTour(p.population,p.owner);
			if(shinobeer.utils.ShinoUtil.enemy(p.owner.id)) {
				enemyPlanet = true;
				this.enemyPlanets.push(this.planetes.get(p.id));
				this.noMyPlanets.push(this.planetes.get(p.id));
			} else if(shinobeer.utils.ShinoUtil.ami(p.owner.id)) this.myPlanets.push(this.planetes.get(p.id)); else if(shinobeer.utils.ShinoUtil.neutre(p.owner.id)) {
				this.neutrePlanets.push(this.planetes.get(p.id));
				this.noMyPlanets.push(this.planetes.get(p.id));
			}
		}
		return enemyPlanet;
	}
	,initShinoContext: function(context) {
		var definePlayer = new haxe.ds.StringMap();
		var _g = 0, _g1 = context.content;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			this.planetes.set(p.id,new shinobeer.beans.ShinoPlanet(p));
			if(definePlayer.exists(p.owner.id)) definePlayer.set(p.owner.id,definePlayer.get(p.owner.id) + 1); else definePlayer.set(p.owner.id,1);
		}
		var $it0 = definePlayer.keys();
		while( $it0.hasNext() ) {
			var player = $it0.next();
			var nbPLanet = definePlayer.get(player);
			if(nbPLanet == 1) {
				if(player != this.id) shinobeer.utils.ShinoUtil.enemyId = player;
			} else if(nbPLanet > 1) shinobeer.utils.ShinoUtil.neutreId = player;
		}
	}
	,addOrder: function(source,target,numUnits) {
		var order = new com.tamina.planetwars.data.Order(source.id,target.id,numUnits);
		if(numUnits > 0 && shinobeer.utils.ShinoUtil.ami(source.owner.id) && this.planetes.get(source.id).popControl >= numUnits) {
			this.planetes.get(source.id).popControl -= numUnits;
			var maxPop = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size);
			var afterAtak = numUnits - Math.round(Math.max(target.population - com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(source,target) * 5,maxPop));
			if(afterAtak > 0) {
				var lost = afterAtak - maxPop;
				if(lost > 0) {
					order.numUnits = maxPop + 10;
					this.futurOrders.push(new shinobeer.beans.ShinoOrder(source,target,numUnits - maxPop - 10,this.numTour + 1));
				}
			}
			this.ordersForTurn.push(order);
		}
		return order;
	}
	,getOrders: function(context) {
		this.noAttackForTurn = false;
		this.numTour++;
		this.ordersForTurn = new Array();
		this.shipsOnTurn = new Array();
		if(this.numTour == 0) {
			shinobeer.utils.ShinoUtil.me = this;
			this.initShinoContext(context);
		}
		if(this.updatePlanetes(context) == false) return this.ordersForTurn;
		this.updateShip(context);
		this.iaCompute(context);
		return this.ordersForTurn;
	}
	,iaCompute: function(context) {
	}
	,mainInit: function() {
		this.numTour = -1;
		this.fisrtAttaque = true;
		this.planetes = new haxe.ds.StringMap();
		this.vaisseaux = new haxe.ds.IntMap();
		this.futurOrders = new Array();
		WorkerIA.instance = this;
	}
	,__class__: shinobeer.ShinoBase
});
shinobeer.ShinoBotUltimate = function() {
	shinobeer.ShinoBase.call(this,"ShinoBotUltimate",3);
};
shinobeer.ShinoBotUltimate.__name__ = true;
shinobeer.ShinoBotUltimate.main = function() {
	var shinoBot = new shinobeer.ShinoBotUltimate();
	shinoBot.mainInit();
	shinoBot.safeMode = false;
}
shinobeer.ShinoBotUltimate.__super__ = shinobeer.ShinoBase;
shinobeer.ShinoBotUltimate.prototype = $extend(shinobeer.ShinoBase.prototype,{
	addOrder2: function(orders,source,target,numUnits) {
		var order = new com.tamina.planetwars.data.Order(source.id,target.id,numUnits);
		if(this.populationsControl.get(source.id) > numUnits && source.population > numUnits) {
			this.populationsControl.set(source.id,this.populationsControl.get(source.id) - numUnits);
			this.populationsControl.set(target.id,this.populationsControl.get(target.id) + numUnits);
			this.ordersForTurn.push(order);
			orders.push(order);
		}
		return order;
	}
	,shinoBot: function(context) {
		shinobeer.utils.ShinoUtil.me = this;
		this.numTour++;
		this.debugMessage = "Num tour : " + this.numTour + "   firstAttaque : " + Std.string(this.fisrtAttaque);
		var orders = new Array();
		this.populations = new haxe.ds.StringMap();
		this.populationsControl = new haxe.ds.StringMap();
		var noOtherPlanet = true;
		var _g = 0, _g1 = context.content;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			this.populations.set(p.id,p.owner.id == this.id?p.population:-p.population);
			this.populationsControl.set(p.id,p.owner.id == this.id?p.population:-p.population);
			if(p.owner.id != this.id) noOtherPlanet = false;
		}
		if(noOtherPlanet) return orders;
		var _g = 0, _g1 = context.fleet;
		while(_g < _g1.length) {
			var vaisseau = _g1[_g];
			++_g;
			if(vaisseau.owner.id != this.id && vaisseau.target.owner.id == this.id) this.populations.set(vaisseau.target.id,this.populations.get(vaisseau.target.id) - vaisseau.crew - (vaisseau.travelDuration - (this.numTour - vaisseau.creationTurn) * 5));
			if(vaisseau.owner.id == this.id && vaisseau.target.owner.id != this.id) this.populations.set(vaisseau.target.id,this.populations.get(vaisseau.target.id) + Math.round(vaisseau.crew - (vaisseau.travelDuration - (this.numTour - vaisseau.creationTurn) * 5) * 0.5));
			if(vaisseau.owner.id == this.id && vaisseau.target.owner.id == this.id) this.populations.set(vaisseau.target.id,this.populations.get(vaisseau.target.id) + Math.round(vaisseau.crew + (vaisseau.travelDuration - (this.numTour - vaisseau.creationTurn) * 5) * 0.5));
		}
		var myPlanets = shinobeer.utils.ShinoUtil.getMyPlanets(context.content);
		var _g1 = 0, _g = myPlanets.length;
		while(_g1 < _g) {
			var i = _g1++;
			var myCurrentPlanet = myPlanets[i];
			var prochePlanets = new Array();
			var k = 0;
			var enemyPlanets = null;
			do {
				enemyPlanets = shinobeer.utils.ShinoUtil.getEnemyPlanets(context.content);
				k++;
				if(enemyPlanets.length > 0) {
					if(this.fisrtAttaque) {
						prochePlanets = shinobeer.utils.ShinoUtil.getFirstPlanet(myCurrentPlanet,context.content);
						if(prochePlanets.length == 0) prochePlanets = shinobeer.utils.ShinoUtil.getEnemyPlanets(enemyPlanets);
					} else prochePlanets = shinobeer.utils.ShinoUtil.getPlanetsByDistance(myCurrentPlanet,Math.round(60 * k),enemyPlanets);
				}
			} while(enemyPlanets.length > 0 && prochePlanets.length <= 0);
			if(this.fisrtAttaque && prochePlanets[0].owner.id == "5") {
				this.fisrtAttaque = false;
				var nbUnit = 10 + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(myCurrentPlanet,prochePlanets[0]) * 5 + prochePlanets[0].population;
				this.debugMessage += "a 1 : " + nbUnit;
				this.addOrder2(orders,myCurrentPlanet,prochePlanets[0],nbUnit);
				return orders;
			}
			if(prochePlanets != null) {
				var _g3 = 0, _g2 = prochePlanets.length;
				while(_g3 < _g2) {
					var j = _g3++;
					var enemyPlanet = prochePlanets[j];
					var nbUnit = 1 + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(myCurrentPlanet,prochePlanets[j]) * 5 + enemyPlanet.population;
					var nbUnitEnemy = myCurrentPlanet.population - com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(enemyPlanet,prochePlanets[j]) * 5;
					if(nbUnit - this.populations.get(enemyPlanet.id) > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(prochePlanets[j].size)) nbUnit = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(prochePlanets[j].size);
					if(this.populationsControl.get(myCurrentPlanet.id) > nbUnit) {
						this.debugMessage += "a 2 : " + nbUnit;
						this.addOrder2(orders,myCurrentPlanet,prochePlanets[j],nbUnit);
					} else if(this.populationsControl.get(myCurrentPlanet.id) == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myCurrentPlanet.size)) {
						nbUnit = Math.round(this.populationsControl.get(myCurrentPlanet.id) * 0.5);
						this.debugMessage += "a 3 : " + nbUnit;
						this.addOrder2(orders,myCurrentPlanet,prochePlanets[j],nbUnit);
					} else if(myCurrentPlanet.population > nbUnitEnemy) {
						this.debugMessage += "a 4 : " + nbUnit;
						this.addOrder2(orders,myCurrentPlanet,prochePlanets[j],myCurrentPlanet.population - nbUnitEnemy);
					}
				}
			}
		}
		return orders;
	}
	,shinoAttack: function() {
		if(!this.safeMode) {
			var _g = 0, _g1 = this.myPlanets;
			while(_g < _g1.length) {
				var mp = _g1[_g];
				++_g;
				var ep = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
				var p = shinobeer.utils.ShinoUtil.getIntermediateOrEnemyPlanete(mp,ep,this.myPlanets);
				if(p.id == ep.id) {
					var nbUnit = 1 + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,ep) * 5 + ep.population;
					if(nbUnit - ep.population > ep.maxPopulation) nbUnit = ep.maxPopulation;
					if(mp.popControl > nbUnit) this.addOrder(mp,ep,nbUnit); else if(mp.popControl == mp.maxPopulation) {
						nbUnit = Math.round(mp.popControl * 0.5);
						this.debugMessage += "<br >--------------------------- shinoAttack 1 : " + nbUnit;
						this.addOrder(mp,ep,nbUnit);
					} else {
						this.debugMessage += "<br >--------------------------- shinoAttack 2 : " + mp.popControl;
						this.addOrder(mp,ep,mp.popControl);
					}
				} else {
				}
			}
		}
	}
	,attakSafe: function() {
		if(this.safeMode && this.myPlanets.length >= 2) {
			var _g = 0, _g1 = this.myPlanets;
			while(_g < _g1.length) {
				var mp = _g1[_g];
				++_g;
				var ep = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
				var tmp = Math.round(mp.popDispoSafe - ep.population + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,ep));
				if(tmp >= 5 && mp.vaisseauAttaque.length == 0) {
					var p = shinobeer.utils.ShinoUtil.getIntermediateOrEnemyPlanete(mp,ep,this.myPlanets);
					this.debugMessage += "<br >--------------------------- attakSafe 1 : " + tmp;
					this.addOrder(mp,p,tmp);
				}
			}
		}
	}
	,shipAttackTurn: function(context) {
		if(!this.noAttackForTurn && this.myPlanets.length > 0) {
			var secondExpand = false;
			if(this.shipsOnTurn.length > 0) {
				this.debugMessage += "<br />shipsOnTurn.length=" + this.shipsOnTurn.length;
				var _g = 0, _g1 = this.shipsOnTurn;
				while(_g < _g1.length) {
					var ship = _g1[_g];
					++_g;
					this.debugMessage += "<br />ship : creationTurn=" + ship.creationTurn + ", travelDuration=" + ship.travelDuration + ", crew=" + ship.crew;
					if(shinobeer.utils.ShinoUtil.ami(ship.target.owner.id) && this.planetes.get(ship.target.id).population > ship.crew) break;
					var _g2 = 0, _g3 = this.myPlanets;
					while(_g2 < _g3.length) {
						var mp = _g3[_g2];
						++_g2;
						var nbTurn = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,ship.target);
						var nbUnitLive = ship.target.population + (ship.travelDuration - 1) * 5 - ship.crew;
						this.debugMessage += "<br />nbUnitLive=" + nbUnitLive;
						this.debugMessage += "<br />p.popdisposafe=" + this.planetes.get(ship.target.id).popAfterAllAttack;
						if(this.planetes.get(ship.target.id).popAfterAllAttack < 5) {
							nbUnitLive = -this.planetes.get(ship.target.id).popAfterAllAttack;
							var popEnFirstPlanetAfterMyAtak = ship.source.population + nbTurn * 5;
							var popEnSecondPlanetAfterMyAtak = nbUnitLive + (nbTurn - (ship.travelDuration - 1)) * 5;
							var nbUnit = popEnFirstPlanetAfterMyAtak + popEnSecondPlanetAfterMyAtak - ship.travelDuration * 5 + 1;
							if(ship.travelDuration - 1 < nbTurn) {
								if(nbUnit <= mp.population) {
									this.debugMessage += "<br >--------------------------- shipAttakc 1 : " + nbUnit;
									this.addOrder(mp,ship.target,nbUnit);
									break;
								} else if(nbTurn / ship.travelDuration <= 2) {
									nbUnit = mp.population - 1;
									this.debugMessage += "<br >--------------------------- shipAttakc 2 : " + nbUnit;
									this.addOrder(mp,ship.target,nbUnit);
									break;
								}
							} else {
								this.debugMessage += "<br >--------------------------- shipAttakc 3 futur : " + (this.numTour + (ship.travelDuration - 1 - nbTurn));
								this.futurOrders.push(new shinobeer.beans.ShinoOrder(this.myPlanets[0],ship.target,nbUnit + 5,this.numTour + (ship.travelDuration - 1 - nbTurn)));
							}
						} else {
						}
					}
				}
			}
			this.debugMessage += "<br><br>  st " + this.ordersForTurn.length + " " + this.futurOrders.length;
			if(this.numTour == 1 && this.ordersForTurn.length == 0 && this.futurOrders.length == 0) {
				var myProchePlanet = shinobeer.utils.ShinoUtil.getFirstPlanet50(this.myPlanets[0],context.content)[0];
				var myDistance = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(this.myPlanets[0],myProchePlanet);
				var nbUnit = 10 + myDistance * 5 + myProchePlanet.population;
				if(nbUnit > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myProchePlanet.size)) nbUnit = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myProchePlanet.size) + 10;
				this.debugMessage += "<br >--------------------------- secondAttak : " + nbUnit;
				this.addOrder(this.myPlanets[0],myProchePlanet,nbUnit);
				return;
			}
		}
	}
	,sauvonsLesCopains: function() {
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var mpHelp = _g1[_g];
			++_g;
			if(mpHelp.popAfterAllAttack < 0) {
				var _g2 = 0, _g3 = this.myPlanets;
				while(_g2 < _g3.length) {
					var mpHero = _g3[_g2];
					++_g2;
					if(mpHelp.planeteChangingInTurn == com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mpHelp,mpHero) + this.numTour) {
						if(mpHero.popDispoSafe >= -mpHelp.popAfterAllAttack + 1) {
							this.debugMessage += "<br >--------------------------- sauvons Les Copains 1 : " + (-mpHelp.popAfterAllAttack + 1);
							this.addOrder(mpHero,mpHelp,-mpHelp.popAfterAllAttack + 1);
							break;
						}
					}
				}
			}
		}
	}
	,courageFuyons: function() {
		var _g = 0, _g1 = this.myPlanets;
		while(_g < _g1.length) {
			var mp = _g1[_g];
			++_g;
			if(mp.ifFleeEnemyLosesNbUnit > 0 && mp.planeteChangingInTurn == this.numTour) {
				var _g2 = 0, _g3 = this.enemyPlanets;
				while(_g2 < _g3.length) {
					var ep = _g3[_g2];
					++_g2;
					if(ep.popDispoSafe + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,ep) * 5 < mp.population) {
						this.debugMessage += "<br >--------------------------- courage fuyons 1 : " + mp.population;
						this.addOrder(mp,ep,mp.population);
						return;
					}
				}
				var _g2 = 0, _g3 = this.myPlanets;
				while(_g2 < _g3.length) {
					var mp2 = _g3[_g2];
					++_g2;
					if(mp.popAfterAllAttack < 0) {
						if(mp.planeteChangingInTurn > com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,mp2) + this.numTour) {
							mp.popAfterAllAttack += mp.population;
							this.debugMessage += "<br >--------------------------- courage fuyons 2 : " + mp.population;
							this.addOrder(mp,mp2,mp.population);
							return;
						}
					}
				}
				var neastedMyPlanet = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.myPlanets);
				var neastedEnemyPlanet = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
				if(neastedMyPlanet != null && neastedEnemyPlanet != null) {
					if(shinobeer.utils.ShinoUtil.getDistanceBetween(mp,neastedMyPlanet) <= shinobeer.utils.ShinoUtil.getDistanceBetween(mp,neastedEnemyPlanet)) {
						this.debugMessage += "<br >--------------------------- courage fuyons 3 : " + mp.population;
						this.addOrder(mp,neastedMyPlanet,mp.population);
					} else {
						this.debugMessage += "<br >--------------------------- courage fuyons 4 : " + mp.population;
						this.addOrder(mp,neastedEnemyPlanet,mp.population);
					}
				} else if(neastedMyPlanet != null) {
					this.debugMessage += "<br >--------------------------- courage fuyons 5 : " + mp.population;
					this.addOrder(mp,neastedMyPlanet,mp.population);
				} else if(neastedEnemyPlanet != null) {
					this.debugMessage += "<br >--------------------------- courage fuyons 6 : " + mp.population;
					this.addOrder(mp,neastedEnemyPlanet,mp.population);
				}
			}
		}
	}
	,depop: function() {
		if(!this.noAttackForTurn) {
			var _g = 0, _g1 = this.myPlanets;
			while(_g < _g1.length) {
				var mp = _g1[_g];
				++_g;
				var ep = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
				var ep1 = shinobeer.utils.ShinoUtil.getIntermediateOrEnemyPlanete(mp,ep,this.myPlanets);
				var tmp = Math.round(mp.popDispoSafe - ep1.population + com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(mp,ep1) * 5);
				if(tmp >= 5 && mp.vaisseauAttaque.length == 0) {
					this.debugMessage += "<br >--------------------------- depop 1 : " + tmp;
					this.addOrder(mp,ep1,tmp);
				}
				if(mp.attackersInThisTurn >= mp.maxPopulation) {
					var nbUnit = mp.attackersInThisTurn - mp.maxPopulation + 5;
					var ep2 = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
					this.debugMessage += "<br >--------------------------- depop 2 : " + nbUnit;
					this.addOrder(mp,ep2,nbUnit);
				}
				if(!mp.enemyAttackNextTurn && mp.popControl >= mp.maxPopulation) {
					var ep2 = shinobeer.utils.ShinoUtil.getNeastedPlanetShino(mp,this.enemyPlanets);
					this.debugMessage += "<br >--------------------------- depop 3 : 5";
					this.debugMessage += "<br />depop " + mp.popControl + " >= " + mp.maxPopulation;
					this.addOrder(mp,ep2,5);
				}
			}
		}
	}
	,resetAttaqueMassiveTurn: function() {
		var $it0 = ((function(_e) {
			return function() {
				return _e.iterator();
			};
		})(this.planetes))();
		while( $it0.hasNext() ) {
			var sp = $it0.next();
			if(sp.attaqueMassiveTurn == this.numTour) sp.attaqueMassiveTurn = -1;
		}
	}
	,launchFuturOrder: function() {
		var tmp = new Array();
		var _g = 0, _g1 = this.futurOrders;
		while(_g < _g1.length) {
			var fo = _g1[_g];
			++_g;
			if(this.numTour == fo.attaqueTurnNb) {
				this.debugMessage += "<br >--------------------------- launchFutur 1 : " + fo.numUnits;
				this.addOrder(fo.source,fo.target,fo.numUnits);
			} else tmp.push(fo);
		}
		this.futurOrders = tmp;
	}
	,chooseStrategyFirstTurn: function(context) {
		if(this.numTour == 0) {
			var enemyProchePlanet = shinobeer.utils.ShinoUtil.getNeastedNeutrePlanet(this.enemyPlanets[0],context.content)[0];
			this.debugMessage += "<br />enemyProchePlanet : " + enemyProchePlanet.id;
			var enemyDistance = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(this.enemyPlanets[0],enemyProchePlanet);
			var enemyDistanceForMe = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(this.myPlanets[0],enemyProchePlanet);
			this.debugMessage += "<br />enemyDistance : " + enemyDistance;
			this.debugMessage += "<br />enemyDistanceForMe : " + enemyDistanceForMe;
			var ratioEnemyDistance = enemyDistanceForMe / enemyDistance;
			this.debugMessage += "<br />ratioEnemyDistance : " + ratioEnemyDistance;
			if(ratioEnemyDistance <= 2 || ratioEnemyDistance <= 2.5 && enemyProchePlanet.size == 4) {
				this.noAttackForTurn = true;
				this.safeMode = true;
				this.debugMessage += "<br /> wait turn 2";
			}
			if(!this.noAttackForTurn) {
				var myProchePlanet = shinobeer.utils.ShinoUtil.getFirstPlanet(this.myPlanets[0],context.content)[0];
				var myDistance = com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(this.myPlanets[0],myProchePlanet);
				var nbUnit = 10 + myDistance * 5 + myProchePlanet.population;
				if(nbUnit > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myProchePlanet.size)) nbUnit = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myProchePlanet.size) - 1;
				this.debugMessage += "<br >--------------------------- firstAttack 1 : " + nbUnit;
				this.addOrder(this.myPlanets[0],myProchePlanet,nbUnit);
				return;
			}
		}
	}
	,iaCompute: function(context) {
		this.debugMessage = "<br />numTour=" + this.numTour;
		this.chooseStrategyFirstTurn(context);
		if(this.enemyPlanets[0].owner.name != null && this.enemyPlanets[0].owner.name.toUpperCase() == "JARVIS" && this.safeMode == false) {
			this.ordersForTurn = new Array();
			this.shinoBot(context);
		} else {
			this.shipAttackTurn(context);
			this.sauvonsLesCopains();
			this.shinoAttack();
			this.launchFuturOrder();
			this.resetAttaqueMassiveTurn();
			this.courageFuyons();
			this.attakSafe();
			this.depop();
		}
	}
	,__class__: shinobeer.ShinoBotUltimate
});
shinobeer.beans = {}
shinobeer.beans.ShinoOrder = function(source,target,numUnits,attaqueTurnNb) {
	this.source = source;
	this.target = target;
	this.numUnits = numUnits;
	this.attaqueTurnNb = attaqueTurnNb;
};
shinobeer.beans.ShinoOrder.__name__ = true;
shinobeer.beans.ShinoOrder.prototype = {
	__class__: shinobeer.beans.ShinoOrder
}
shinobeer.beans.ShinoPlanet = function(planet) {
	this.enemyAttackNextTurn = false;
	this.changeOwner = false;
	this.attaqueMassiveTurn = -1;
	com.tamina.planetwars.data.Planet.call(this,planet.x,planet.y,planet.size,planet.owner);
	this.id = planet.id;
	this.maxPopulation = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size);
	this.vaisseauAttaque = new Array();
};
shinobeer.beans.ShinoPlanet.__name__ = true;
shinobeer.beans.ShinoPlanet.__super__ = com.tamina.planetwars.data.Planet;
shinobeer.beans.ShinoPlanet.prototype = $extend(com.tamina.planetwars.data.Planet.prototype,{
	sortShipTurn: function(a,b) {
		if(a.creationTurn + a.travelDuration < b.creationTurn + b.travelDuration) return -1;
		if(a.creationTurn + a.travelDuration > b.creationTurn + b.travelDuration) return 1;
		return 0;
	}
	,computeShips: function(currentTurn) {
		this.vaisseauAttaque.sort($bind(this,this.sortShipTurn));
		var lastNbTurn = currentTurn;
		var tmpPop = this.population;
		var tmpMinPop = this.population;
		var tmpOwnerId = this.owner.id;
		var _g = 0, _g1 = this.vaisseauAttaque;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			var nbTurnBetween = s.creationTurn + s.travelDuration - lastNbTurn - 1;
			if(s.creationTurn + s.travelDuration <= currentTurn && s.owner.id != this.owner.id) this.enemyAttackNextTurn = true;
			if(s.creationTurn + s.travelDuration <= currentTurn) {
				if(s.owner.id == this.owner.id) this.attackersInThisTurn += s.crew; else this.attackersInThisTurn -= s.crew;
			}
			tmpPop += nbTurnBetween * 5;
			if(tmpPop > this.maxPopulation) tmpPop = this.maxPopulation;
			if(tmpOwnerId != s.owner.id) {
				tmpPop -= s.crew;
				if(tmpPop < 0) {
					tmpPop = 0 - tmpPop;
					tmpOwnerId = s.owner.id;
					if(s.owner.id != this.owner.id) {
						this.planeteChangingInTurn = s.creationTurn + s.travelDuration;
						if(s.crew > this.maxPopulation) this.ifFleeEnemyLosesNbUnit = s.crew - this.maxPopulation;
					}
				}
			} else tmpPop += s.crew;
			if(tmpPop < tmpMinPop) tmpMinPop = tmpPop;
			lastNbTurn += nbTurnBetween;
		}
		this.popDispoSafe = tmpMinPop;
		if(this.owner.id != tmpOwnerId) {
			this.changeOwner = true;
			this.popAfterAllAttack = -tmpPop;
		} else {
			this.changeOwner = false;
			this.popAfterAllAttack = tmpPop;
		}
	}
	,addShip: function(s) {
		if(s.crew > 0) this.vaisseauAttaque.push(s);
	}
	,setDebutTour: function(newPopulation,newOwner) {
		this.population = newPopulation;
		this.popControl = newPopulation;
		this.popDispoSafe = newPopulation;
		this.popAfterAllAttack = newPopulation;
		this.attackersInThisTurn = newPopulation;
		if(this.owner.id != newOwner.id) {
			if(shinobeer.utils.ShinoUtil.ami(newOwner.id)) this.attaqueMassiveTurn = -1;
		}
		this.owner = newOwner;
		this.enemyAttackNextTurn = false;
		this.planeteChangingInTurn = 0;
		this.ifFleeEnemyLosesNbUnit = 0;
	}
	,__class__: shinobeer.beans.ShinoPlanet
});
shinobeer.beans.ShinoShip = function(ship) {
	com.tamina.planetwars.data.Ship.call(this,ship.crew,ship.source,ship.target,ship.creationTurn);
	this.createOid();
};
shinobeer.beans.ShinoShip.__name__ = true;
shinobeer.beans.ShinoShip.__super__ = com.tamina.planetwars.data.Ship;
shinobeer.beans.ShinoShip.prototype = $extend(com.tamina.planetwars.data.Ship.prototype,{
	createOid: function() {
		return this.creationTurn - 1 + Std.parseInt(this.source.id) * 1000 + Std.parseInt(this.target.id) * 10000 + this.crew * 100000;
	}
	,__class__: shinobeer.beans.ShinoShip
});
shinobeer.utils = {}
shinobeer.utils.ShinoUtil = function() { }
shinobeer.utils.ShinoUtil.__name__ = true;
shinobeer.utils.ShinoUtil.ami = function(id) {
	return id == shinobeer.utils.ShinoUtil.me.id;
}
shinobeer.utils.ShinoUtil.enemy = function(id) {
	return id == shinobeer.utils.ShinoUtil.enemyId;
}
shinobeer.utils.ShinoUtil.neutre = function(id) {
	return id == shinobeer.utils.ShinoUtil.neutreId;
}
shinobeer.utils.ShinoUtil.getDistanceBetween = function(p1,p2) {
	return com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(p1.x,p1.y),new com.tamina.planetwars.geom.Point(p2.x,p2.y));
}
shinobeer.utils.ShinoUtil.getAvgTurn = function(pfocus,planets) {
	var nbTurn = 0;
	var _g = 0;
	while(_g < planets.length) {
		var p = planets[_g];
		++_g;
		nbTurn += com.tamina.planetwars.utils.GameUtil.getTravelNumTurn(p,pfocus);
	}
	return nbTurn / planets.length;
}
shinobeer.utils.ShinoUtil.getMyPlanets = function(planets) {
	var result = new Array();
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id == shinobeer.utils.ShinoUtil.me.id) result.push(p);
	}
	return result;
}
shinobeer.utils.ShinoUtil.getEnemyPlanets = function(planets) {
	var result = new Array();
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id != shinobeer.utils.ShinoUtil.me.id && p.owner.id != "5") result.push(p);
	}
	return result;
}
shinobeer.utils.ShinoUtil.getNeutralPlanets = function(planets) {
	var result = new Array();
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id == "5") result.push(p);
	}
	return result;
}
shinobeer.utils.ShinoUtil.getPlanetsByDistance = function(source,dist,planets) {
	var result = new Array();
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.id != source.id) {
			if(shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < dist) result.push(p);
		}
	}
	return result;
}
shinobeer.utils.ShinoUtil.getFirstPlanet = function(source,planets) {
	var result = new Array();
	var pla = null;
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id == "5" && p.id != source.id) {
			if(pla == null || shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < shinobeer.utils.ShinoUtil.getDistanceBetween(source,pla)) pla = p;
		}
	}
	if(pla != null) result.push(pla);
	return result;
}
shinobeer.utils.ShinoUtil.getFirstPlanet50 = function(source,planets) {
	var result = new Array();
	var pla = null;
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id == "5" && p.id != source.id && p.size == 1) {
			if(pla == null || shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < shinobeer.utils.ShinoUtil.getDistanceBetween(source,pla)) pla = p;
		}
	}
	if(pla != null) result.push(pla);
	return result;
}
shinobeer.utils.ShinoUtil.getNeastedNeutrePlanet = function(source,planets) {
	var result = new Array();
	var pla = null;
	var _g1 = 0, _g = planets.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = planets[i];
		if(p.owner.id == "5" && p.id != source.id) {
			if(pla == null || shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < shinobeer.utils.ShinoUtil.getDistanceBetween(source,pla)) pla = p;
		}
	}
	if(pla != null) result.push(pla);
	return result;
}
shinobeer.utils.ShinoUtil.getNeastedPlanetShino = function(source,planets) {
	var pla = null;
	var _g = 0;
	while(_g < planets.length) {
		var p = planets[_g];
		++_g;
		if(p.id != source.id) {
			if(pla == null || shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < shinobeer.utils.ShinoUtil.getDistanceBetween(source,pla)) pla = p;
		}
	}
	return pla;
}
shinobeer.utils.ShinoUtil.getIntermediateOrEnemyPlanete = function(source,target,planets) {
	var intermediate = null;
	var dist = shinobeer.utils.ShinoUtil.getDistanceBetween(source,target);
	var _g = 0;
	while(_g < planets.length) {
		var p = planets[_g];
		++_g;
		if(shinobeer.utils.ShinoUtil.getDistanceBetween(source,p) < dist) {
			if(intermediate == null || shinobeer.utils.ShinoUtil.getDistanceBetween(p,target) < shinobeer.utils.ShinoUtil.getDistanceBetween(intermediate,target)) intermediate = p;
		}
	}
	if(intermediate != null) return intermediate;
	return target;
}
shinobeer.utils.ShinoUtil.prototype = {
	ShinoUtil: function() {
	}
	,__class__: shinobeer.utils.ShinoUtil
}
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
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
onmessage = WorkerIA.prototype.messageHandler;
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
shinobeer.ShinoBotUltimate.main();
})();
