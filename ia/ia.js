(function() {
  var Galaxy, Game, GameUtil, Order, Planet, PlanetPopulation, PlanetSize, Point, Range, Ship, TurnMessage, TurnResult, UID, actualTurn, color, croissanceParTour, debugMessage, evacTotal, getEasyPlanets, getEasyestPlanet, getNearestPlanet, getOrders, getShipGoingTo, getShipLandingTurn, id, name, naturalPopInXTurn, planeteInXTurn;

  name = "IA 1nomable";

  color = 0;

  debugMessage = "";

  id = 0;

  actualTurn = 0;

  croissanceParTour = 5;

  /*
    @internal method
  */


  this.onmessage = function(event) {
    var turnMessage;
    if (event.data != null) {
      turnMessage = event.data;
      id = turnMessage.playerId;
      return postMessage(new TurnResult(getOrders(turnMessage.galaxy), debugMessage));
    } else {
      return postMessage("data null");
    }
  };

  /*
    Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
    C'est la methode à modifier pour cabler son IA.
    @param context:Galaxy
    @return result:Array<Order>
  */


  getOrders = function(context) {
    var e, ennemisEnRoute, landNextTurn, myPlanet, myPlanets, otherPlanets, populationGoal, puissanceAdverse, result, ship, target, targetFutur, targets, travelTime, _i, _j, _k, _len, _len1, _len2;
    debugMessage = '<br>Tour ' + actualTurn;
    result = [];
    try {
      myPlanets = GameUtil.getPlayerPlanets(id, context);
      otherPlanets = GameUtil.getEnnemyPlanets(id, context);
      if (otherPlanets !== null && otherPlanets.length > 0) {
        for (_i = 0, _len = myPlanets.length; _i < _len; _i++) {
          myPlanet = myPlanets[_i];
          targets = getEasyPlanets(myPlanet, context, otherPlanets);
          target = targets[Math.floor(Math.random() * targets.length)];
          travelTime = GameUtil.getTravelNumTurn(myPlanet, target);
          targetFutur = planeteInXTurn(target, context, travelTime);
          populationGoal = 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet, target)).population;
          if (myPlanet.population > populationGoal) {
            result.push(new Order(myPlanet.id, target.id, populationGoal));
            myPlanet.population -= populationGoal;
          }
          if (planeteInXTurn(myPlanet, context, 1).population >= PlanetPopulation.getMaxPopulation(myPlanet.size)) {
            target = getEasyestPlanet(myPlanet, context, otherPlanets);
            populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet, target)).population);
            result.push(new Order(myPlanet.id, target.id, populationGoal));
            myPlanet.population -= populationGoal;
          }
          ennemisEnRoute = getShipGoingTo(myPlanet, GameUtil.getEnnemyFleets(id, context));
          landNextTurn = false;
          for (_j = 0, _len1 = ennemisEnRoute.length; _j < _len1; _j++) {
            ship = ennemisEnRoute[_j];
            if (1 === getShipLandingTurn(ship) - actualTurn) {
              landNextTurn = true;
            }
          }
          if (landNextTurn) {
            puissanceAdverse = 0;
            for (_k = 0, _len2 = ennemisEnRoute.length; _k < _len2; _k++) {
              ship = ennemisEnRoute[_k];
              puissanceAdverse += ship.crew;
            }
            if (puissanceAdverse > PlanetPopulation.getMaxPopulation(myPlanet.size)) {
              result = evacTotal(myPlanet, context, result);
            }
          }
          if (planeteInXTurn(myPlanet, context, 1).population >= PlanetPopulation.getMaxPopulation(myPlanet.size)) {
            target = getEasyestPlanet(myPlanet, context, otherPlanets);
            populationGoal = Math.min(myPlanet.population, 1 + planeteInXTurn(target, context, GameUtil.getTravelNumTurn(myPlanet, target)).population);
            result.push(new Order(myPlanet.id, target.id, populationGoal));
          }
        }
      }
    } catch (_error) {
      e = _error;
      debugMessage += e;
    }
    actualTurn++;
    return result;
  };

  evacTotal = function(myPlanet, context, result) {
    var target;
    target = getNearestPlanet(myPlanet, context.content);
    result.push(new Order(myPlanet.id, target.id, myPlanet.population));
    return result;
  };

  naturalPopInXTurn = function(planet, turn) {
    return Math.min(planet.population + turn * croissanceParTour, PlanetPopulation.getMaxPopulation(planet.size));
  };

  planeteInXTurn = function(planet, context, turn) {
    var fleet, pclone, pop, s, t, _i, _j, _len;
    pclone = {
      size: planet.size,
      population: planet.population,
      owner: planet.owner,
      id: planet.id,
      x: planet.x,
      y: planet.y,
      ref: planet
    };
    pop = pclone.population - 5;
    fleet = getShipGoingTo(pclone.ref, context.fleet);
    for (t = _i = 0; 0 <= turn ? _i <= turn : _i >= turn; t = 0 <= turn ? ++_i : --_i) {
      for (_j = 0, _len = fleet.length; _j < _len; _j++) {
        s = fleet[_j];
        if (getShipLandingTurn(s) === actualTurn + t) {
          if (s.owner === pclone.owner) {
            pop = Math.min(pop + s.crew, PlanetPopulation.getMaxPopulation(pclone.size));
          } else {
            pop = pop - s.crew;
            if (pop < 0) {
              pop = -pop;
              pclone.owner = s.owner;
            }
          }
        }
      }
      pop = Math.min(pop + croissanceParTour, PlanetPopulation.getMaxPopulation(pclone.size));
    }
    pclone.population = pop;
    return pclone;
  };

  getShipLandingTurn = function(ship) {
    return ship.creationTurn + ship.travelDuration;
  };

  getShipGoingTo = function(planet, candidats) {
    var result, s, _i, _len;
    result = [];
    for (_i = 0, _len = candidats.length; _i < _len; _i++) {
      s = candidats[_i];
      if (s.target === planet) {
        result.push(s);
      }
    }
    return result;
  };

  getNearestPlanet = function(source, candidats) {
    var currentDist, dist, element, result, _i, _len;
    result = candidats[0];
    currentDist = GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(result.x, result.y));
    for (_i = 0, _len = candidats.length; _i < _len; _i++) {
      element = candidats[_i];
      dist = GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(element.x, element.y));
      if (currentDist > dist) {
        currentDist = dist;
        result = element;
      }
    }
    return result;
  };

  getEasyestPlanet = function(source, context, candidats) {
    var difficulty, element, minDifficulty, pl, result, travelTime, _i, _len;
    if (!candidats) {
      candidats = context.content;
    }
    result = candidats[0];
    travelTime = GameUtil.getTravelNumTurn(source, candidats[0]);
    pl = planeteInXTurn(result, context, travelTime);
    if (pl.owner === result.owner) {
      minDifficulty = pl.population;
    } else {
      minDifficulty = 9999;
    }
    for (_i = 0, _len = candidats.length; _i < _len; _i++) {
      element = candidats[_i];
      travelTime = GameUtil.getTravelNumTurn(source, element);
      pl = planeteInXTurn(element, context, travelTime);
      if (pl.owner === element.owner) {
        difficulty = pl.population;
      } else {
        difficulty = 9999;
      }
      if (minDifficulty > difficulty) {
        minDifficulty = difficulty;
        result = element;
      }
    }
    return result;
  };

  getEasyPlanets = function(source, context, candidats) {
    var difficulty, easyest, element, minDifficulty, pl, result, travelTime, _i, _len;
    easyest = getEasyestPlanet(source, context, candidats);
    travelTime = GameUtil.getTravelNumTurn(source, easyest);
    pl = planeteInXTurn(easyest, context, travelTime);
    if (pl.owner === easyest.owner) {
      minDifficulty = pl.population;
    } else {
      minDifficulty = 9999;
    }
    result = [];
    for (_i = 0, _len = candidats.length; _i < _len; _i++) {
      element = candidats[_i];
      travelTime = GameUtil.getTravelNumTurn(source, element);
      pl = planeteInXTurn(element, context, travelTime);
      if (pl.owner === element.owner) {
        difficulty = pl.population;
      } else {
        difficulty = 9999;
      }
      if (difficulty <= minDifficulty + 10) {
        result.push(element);
      }
    }
    return result;
  };

  /*
    @model Galaxy
    @param width:Number largeur de la galaxy
    @param height:Number hauteur de la galaxy
  */


  Galaxy = (function() {
    function Galaxy(width, height) {
      this.width = width;
      this.height = height;
      /*contenu : liste Planet*/

      this.content = [];
      /*flote : liste de Ship*/

      this.fleet = [];
    }

    return Galaxy;

  })();

  /*
    @model Range
    @param from:Number début de l'intervale
    @param to:Number fin de l'intervale
  */


  Range = (function() {
    function Range(from, to) {
      this.from = from;
      this.to = to;
    }

    return Range;

  })();

  /*
    @model Order
    @param sourceID:Number id de la planete d'origine
    @param targetID:Number id de la planete cible
    @param numUnits:Number nombre d'unité à déplacer
  */


  Order = (function() {
    function Order(sourceID, targetID, numUnits) {
      this.sourceID = sourceID;
      this.targetID = targetID;
      this.numUnits = numUnits;
    }

    return Order;

  })();

  /*
    @model Planet
    @param x:Number position en x
    @param y:Number position en y
    @param size:Number taille
    @param owner:Player proprietaire
  */


  Planet = (function() {
    function Planet(x, y, size, owner) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.owner = owner;
      /* population*/

      this.population = PlanetPopulation.getDefaultPopulation(size);
      /* id*/

      this.id = UID.get();
    }

    return Planet;

  })();

  /*
    @model Ship
    @param crew:Number equipage
    @param source:Planet origine
    @param target:Planet cible
    @param creationTurn:Number numero du tour de creation du vaisseau
  */


  Ship = (function() {
    function Ship(crew, source, target, creationTurn) {
      this.crew = crew;
      this.source = source;
      this.target = target;
      this.creationTurn = creationTurn;
      /* proprietaire du vaisseau*/

      this.owner = source.owner;
      /* duree du voyage en nombre de tour*/

      this.travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(target.x, target.y)) / Game.SHIP_SPEED);
    }

    return Ship;

  })();

  /*
    @internal model
  */


  TurnMessage = (function() {
    function TurnMessage(playerId, galaxy) {
      this.playerId = playerId;
      this.galaxy = galaxy;
    }

    return TurnMessage;

  })();

  /*
    @internal model
  */


  TurnResult = (function() {
    function TurnResult(orders, consoleMessage) {
      this.orders = orders;
      this.consoleMessage = consoleMessage != null ? consoleMessage : "";
      this.error = "";
    }

    return TurnResult;

  })();

  /*
    @model Point
    @param x:Number
    @param y:Number
  */


  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    return Point;

  })();

  /*
    Classe utilitaire
  */


  GameUtil = (function() {
    function GameUtil() {}

    /*
    	  @param p1:Point
    	  @param p2:Point
    	  @return result:Number la distance entre deux points
    */


    GameUtil.getDistanceBetween = function(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    /*
    	  @param planetOwnerId:Number
    	  @param context:Galaxy
    	  @return result:Array<Planet> la liste des planetes appartenants à un joueur en particulier
    */


    GameUtil.getPlayerPlanets = function(planetOwnerId, context) {
      var p, result, _i, _len, _ref;
      result = [];
      _ref = context.content;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (p.owner.id === planetOwnerId) {
          result.push(p);
        }
      }
      return result;
    };

    /*
    	 @param planetOwnerId:Number
    	 @param context:Galaxy
    	 @return result:Array<Planet> la liste des planetes ennemies et neutres
    */


    GameUtil.getEnnemyPlanets = function(planetOwnerId, context) {
      var p, result, _i, _len, _ref;
      result = [];
      _ref = context.content;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (p.owner.id !== planetOwnerId) {
          result.push(p);
        }
      }
      return result;
    };

    GameUtil.getEnnemyFleets = function(playerId, context) {
      var result, s, _i, _len, _ref;
      result = [];
      _ref = context.fleet;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (s.owner.id !== playerId) {
          result.push(s);
        }
      }
      return result;
    };

    GameUtil.getMyFleets = function(playerId, context) {
      var result, s, _i, _len, _ref;
      result = [];
      _ref = context.fleet;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (s.owner.id === playerId) {
          result.push(s);
        }
      }
      return result;
    };

    GameUtil.getTravelNumTurn = function(source, target) {
      return Math.ceil(GameUtil.getDistanceBetween(new Point(source.x, source.y), new Point(target.x, target.y)) / Game.SHIP_SPEED);
    };

    return GameUtil;

  })();

  /*
    Classe utilitaire
    @internal
  */


  UID = (function() {
    function UID() {}

    UID.lastUID = 0;

    UID.get = function() {
      UID.lastUID++;
      return UID.lastUID;
    };

    return UID;

  })();

  /*
    Constantes
  */


  Game = (function() {
    function Game() {}

    Game.DEFAULT_PLAYER_POPULATION = 100;

    Game.NUM_PLANET = new Range(5, 10);

    Game.PLANET_GROWTH = 5;

    Game.SHIP_SPEED = 60;

    Game.GAME_SPEED = 500;

    Game.GAME_DURATION = 240;

    Game.GAME_MAX_NUM_TURN = 500;

    return Game;

  })();

  PlanetPopulation = (function() {
    function PlanetPopulation() {}

    PlanetPopulation.DEFAULT_SMALL = 20;

    PlanetPopulation.DEFAULT_NORMAL = 30;

    PlanetPopulation.DEFAULT_BIG = 40;

    PlanetPopulation.DEFAULT_HUGE = 50;

    PlanetPopulation.MAX_SMALL = 50;

    PlanetPopulation.MAX_NORMAL = 100;

    PlanetPopulation.MAX_BIG = 200;

    PlanetPopulation.MAX_HUGE = 300;

    PlanetPopulation.getMaxPopulation = function(planetSize) {
      var result;
      result = 1;
      switch (planetSize) {
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
      }
      return result;
    };

    PlanetPopulation.getDefaultPopulation = function(planetSize) {
      var result;
      result = 1;
      switch (planetSize) {
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
      }
      return result;
    };

    return PlanetPopulation;

  })();

  PlanetSize = (function() {
    function PlanetSize() {}

    PlanetSize.SMALL = 1;

    PlanetSize.NORMAL = 2;

    PlanetSize.BIG = 3;

    PlanetSize.HUGE = 4;

    return PlanetSize;

  })();

}).call(this);
