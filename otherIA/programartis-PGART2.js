var name = "noname";
var color = 0;
var debugMessage = "";
var id = 0;
onmessage = function (event) {
    if(event.data != null) {
        var turnMessage = event.data;
        id = turnMessage.playerId;
        postMessage(new TurnResult(getOrders(turnMessage.galaxy), debugMessage));
    } else {
        postMessage("data null");
    }
};
var TurnMessage = (function () {
    function TurnMessage(playerId, galaxy) {
        this.playerId = playerId;
        this.galaxy = galaxy;
    }
    return TurnMessage;
})();
var TurnResult = (function () {
    function TurnResult(orders, message) {
        if (typeof message === "undefined") { message = ""; }
        this.orders = orders;
        this.consoleMessage = message;
        this.error = "";
    }
    return TurnResult;
})();
var Galaxy = (function () {
    function Galaxy(width, height) {
        this.width = width;
        this.height = height;
        this.content = [];
        this.fleet = [];
    }
    Galaxy.prototype.contains = function (planetId) {
        var result = false;
        for(var i in this.content) {
            if(this.content[i].id == planetId) {
                result = true;
                break;
            }
        }
        return result;
    };
    return Galaxy;
})();
var Ship = (function () {
    function Ship(crew, source, target, creationTurn) {
        this.crew = crew;
        this.source = source;
        this.target = target;
        this.owner = source.owner;
        this.creationTurn = creationTurn;
        this.travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(target.x, target.y)) / Game.SHIP_SPEED);
    }
    return Ship;
})();
var Game = (function () {
    function Game() { }
    Game.DEFAULT_PLAYER_POPULATION = 100;
    Game.PLANET_GROWTH = 5;
    Game.SHIP_SPEED = 60;
    Game.MAX_TURN_DURATION = 1000;
    Game.GAME_SPEED = 500;
    Game.GAME_DURATION = 240;
    Game.GAME_MAX_NUM_TURN = 500;
    return Game;
})();
var GameUtil = (function () {
    function GameUtil() { }
    GameUtil.getDistanceBetween = function getDistanceBetween(p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    }
    GameUtil.getPlayerPlanets = function getPlayerPlanets(planetOwnerId, context) {
        var result = [];
        for(var i in context.content) {
            var p = context.content[i];
            if(p.owner.id == planetOwnerId) {
                result.push(p);
            }
        }
        return result;
    }
    GameUtil.getEnnemyPlanets = function getEnnemyPlanets(planetOwnerId, context) {
        var result = [];
        for(var i in context.content) {
            var p = context.content[i];
            if(p.owner.id != planetOwnerId) {
                result.push(p);
            }
        }
        return result;
    }
    return GameUtil;
})();
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Planet = (function () {
    function Planet(x, y, size, owner) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        if (typeof size === "undefined") { size = 2; }
        if (typeof owner === "undefined") { owner = null; }
        this.x = x;
        this.y = y;
        this.size = size;
        this.owner = owner;
        this.population = PlanetPopulation.getDefaultPopulation(size);
        this.id = UID.get().toString();
    }
    return Planet;
})();
var Order = (function () {
    function Order(sourceID, targetID, numUnits) {
        this.sourceID = sourceID;
        this.targetID = targetID;
        this.numUnits = numUnits;
    }
    return Order;
})();
var UID = (function () {
    function UID() { }
    UID._lastUID = 0;
    UID.get = function get() {
        if(this._lastUID == null) {
            this._lastUID = 0;
        }
        this._lastUID++;
        return this._lastUID;
    }
    return UID;
})();
var PlanetPopulation = (function () {
    function PlanetPopulation() { }
    PlanetPopulation.DEFAULT_SMALL = 20;
    PlanetPopulation.DEFAULT_NORMAL = 30;
    PlanetPopulation.DEFAULT_BIG = 40;
    PlanetPopulation.DEFAULT_HUGE = 50;
    PlanetPopulation.MAX_SMALL = 50;
    PlanetPopulation.MAX_NORMAL = 100;
    PlanetPopulation.MAX_BIG = 200;
    PlanetPopulation.MAX_HUGE = 300;
    PlanetPopulation.getMaxPopulation = function getMaxPopulation(planetSize) {
        var result = 1;
        switch(planetSize) {
            case PlanetSize.SMALL: {
                result = PlanetPopulation.MAX_SMALL;

            }
            case PlanetSize.NORMAL: {
                result = PlanetPopulation.MAX_NORMAL;

            }
            case PlanetSize.BIG: {
                result = PlanetPopulation.MAX_BIG;

            }
            case PlanetSize.HUGE: {
                result = PlanetPopulation.MAX_HUGE;

            }
        }
        return result;
    }
    PlanetPopulation.getDefaultPopulation = function getDefaultPopulation(planetSize) {
        var result = 1;
        switch(planetSize) {
            case PlanetSize.SMALL: {
                result = PlanetPopulation.DEFAULT_SMALL;

            }
            case PlanetSize.NORMAL: {
                result = PlanetPopulation.DEFAULT_NORMAL;

            }
            case PlanetSize.BIG: {
                result = PlanetPopulation.DEFAULT_BIG;

            }
            case PlanetSize.HUGE: {
                result = PlanetPopulation.DEFAULT_HUGE;

            }
        }
        return result;
    }
    return PlanetPopulation;
})();
var PlanetSize = (function () {
    function PlanetSize() { }
    PlanetSize.SMALL = 1;
    PlanetSize.NORMAL = 2;
    PlanetSize.BIG = 3;
    PlanetSize.HUGE = 4;
    PlanetSize.SMALL_WIDTH = 20;
    PlanetSize.NORMAL_WIDTH = 30;
    PlanetSize.BIG_WIDTH = 50;
    PlanetSize.HUGE_WIDTH = 70;
    PlanetSize.SMALL_EXTENSION = "_small";
    PlanetSize.NORMAL_EXTENSION = "_normal";
    PlanetSize.BIG_EXTENSION = "_big";
    PlanetSize.HUGE_EXTENSION = "_huge";
    return PlanetSize;
})();
var turnNumber = 0;
var myBot;
var getOrders = function (context) {
    var result = [];
    var myPlanets = GameUtil.getPlayerPlanets(id.toString(), context);
    var otherPlanets = GameUtil.getEnnemyPlanets(id.toString(), context);
    var myBot = new PRGBot(context, turnNumber);
    turnNumber++;
    if(otherPlanets != null && otherPlanets.length > 0) {
 {
            for(var i in myPlanets) {
                var myPlanet = myPlanets[i];
                var target = myBot.getWeakestPlanet(myPlanet, otherPlanets);
                if(myBot.getIsEnnemyAttacking(myPlanet) == false) {
                    if(myPlanet.population >= 50) {
                        result.push(new Order(myPlanet.id, target.id, 40));
                    }
                }
            }
        }
    }
    return result;
};
var getNearestEnnemyPlanet = function (source, candidats) {
    var result = candidats[0];
    var currentDist = GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(result.x, result.y));
    for(var i in candidats) {
        var element = candidats[i];
        if(currentDist > GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(element.x, element.y))) {
            currentDist = GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(element.x, element.y));
            result = element;
        }
    }
    return result;
};
var getSmallestPlanet = function (myPlanet, listPlanet) {
    var distance = 9999;
    var testDist;
    var nearest;
    for(var i in listPlanet) {
        var pl = listPlanet[i];
        testDist = GameUtil.getDistanceBetween(new Point(pl.x, pl.y), new Point(myPlanet.x, myPlanet.y));
        if(testDist < distance) {
            distance = testDist;
            nearest = pl;
        }
    }
    return pl;
};
var PRGBot = (function () {
    function PRGBot(context, turn) {
        this.turnNumber = turn;
        this.gal = context;
    }
    PRGBot.prototype.getIsEnnemyAttacking = function (myPlanet) {
        var aShip;
        for(var i in this.gal.fleet) {
            aShip = this.gal.fleet[i];
            if(aShip.target == myPlanet) {
                return true;
            }
        }
        return false;
    };
    PRGBot.prototype.getTimeBeetween = function (source, dest) {
        var dist = GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(dest.x, dest.y));
        return Math.ceil(dist / Game.SHIP_SPEED);
    };
    PRGBot.prototype.getWeakestPlanet = function (myPlanet, listPlanet) {
        var weakestPop = 1000;
        var endPopulation = 0;
        var weakest;
        for(var i in listPlanet) {
            var pl = listPlanet[i];
            endPopulation = this.getTimeBeetween(myPlanet, pl) * Game.PLANET_GROWTH + pl.population;
            if(endPopulation < weakestPop) {
                weakestPop = endPopulation;
                weakest = pl;
            }
        }
        return weakest;
    };
    return PRGBot;
})();
