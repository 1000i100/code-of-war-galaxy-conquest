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
var name = "basicIA_JS";
var idEnnemy = null ;



/*

Configuration de l'IA
*/


var tailleShip = 0;
var tailleMin = 0;
var lockPlanet = false;
var empireUnderAttack = false;


/**
 * couleur d'affichage
*/
var color = 0;

/** message de debugage
 *  utilisé par le systeme et affiché dans la trace à chaque tour du combat
*/
var debugMessage = "";

/* Id de l'IA */
var id = 0;


var turnNumber = 0;
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
Methode estimation population simple
 * @param planet:Planet
 * @param nvTurn nombre de tour
 * @return population:int


*/
var 	getPopulationFuture= function(planet,nbTurn){
	var previousPopulation = planet.population + (5*nbTurn); 
    var maxPopulation = PlanetPopulation.getMaxPopulation(planet.size);
   
    
 
	return previousPopulation < maxPopulation ? previousPopulation : maxPopulation; 
	};



var getPlanetsStatus =function(context) {
		var planets = new Array();

        var _g1 = 0, _g = context.content.length;
        while(_g1 < _g) {
                var i = _g1++;
                var planet = context.content[i];
                planets[planet.id] = {'planet': planet ,'isAttack':false};			    
        }

		
		var _h1 = 0, _h = context.fleet.length;
	while(_h1 < _h) {
		var j = _h1++;
		var ship = context.fleet[j];
		if( ship.target.id != null){           
			if( ship.owner.id != planets[ship.target.id].planet.owner.id && ship.crew>0){               
                planets[ship.target.id].isAttack=true;
                if(id == planets[ship.target.id].planet.owner.id){
                    empireUnderAttack = true;
                    tailleMin = 10;
                }
            }
		}
	}
	return planets;
	};


updateShipSize = function(planetsPlus){
    rationDominationGalaxy = GameUtil.gePopulationPlayer(id,planetsPlus)/(GameUtil.getPopulationEnnemy(id,planetsPlus) + GameUtil.gePopulationPlayer(id,planetsPlus));
    
   
    if(rationDominationGalaxy>0.75) 
        { tailleShip = 20;}
    else  if(rationDominationGalaxy>0.50)
        { tailleShip = 30;}
    
      if (nbPlanet < 3){ tailleShip = 40;}
    
};


/**
 * Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
 * C'est la methode à modifier pour cabler son IA.
 * @param context:Galaxy
 * @return result:Array<Order>
*/
var getOrders = function(context) {
        turnNumber++;
        GameUtil.iniEnnemyId(id,context);
        var result = new Array();
        var planetsPlus = getPlanetsStatus(context);
        
      
        var myPlanets = GameUtil.getPlayerPlanetsPlus( id, planetsPlus);
        nbPlanet = myPlanets.length;
        updateShipSize(planetsPlus);
        var otherPlanets = GameUtil.getOtherPlanetsPlus(id, planetsPlus);
       var ennemyPlanets = GameUtil.getEnnemyPlanetsPlus(id, planetsPlus);
        var order ;
    
    
    
        if ( otherPlanets != null && otherPlanets.length > 0 )
        {
            
                for ( key in myPlanets )
                {
                        var myPlanetPlus = myPlanets[ key ];
                    
                    if (empireUnderAttack && !myPlanetPlus.isAttack) {
                           
                            order = strategiePredateur(myPlanetPlus, ennemyPlanets);
                        }
                    else
                        if( !myPlanetPlus.isAttack) {
                          order = strategiePredateur(myPlanetPlus, otherPlanets);
                        }   else{
                            order = strategieProie(myPlanetPlus, otherPlanets);
                        }
                     if(order != null){   
                         result.push(order);
                     }
                }
        }
        lockPlanet = false;
        return result;
};

var nbPlanet;
var planetUniq;

/*
Stratégie quand la planète est prédatrice
*/
var strategiePredateur = function(myPlanetPlus, otherPlanets){
    
    
    
    if(myPlanetPlus.planet.population >= tailleMin + tailleShip){    
        var planetAColoniser;
       
        
        if ( nbPlanet <= 5 && !lockPlanet){     
            
            
            planetUniq = getBestTargetPlanet(myPlanetPlus.planet,otherPlanets);
           
            lockPlanet = true;
        }
        else{
              planetAColoniser = getBestTargetPlanet(myPlanetPlus.planet,otherPlanets);
         }
        
        if (lockPlanet){
              planetAColoniser = planetUniq;
            
         } 
        
        
        
        // planetAColoniser = getNearestPlanet(myPlanetPlus.planet,otherPlanets);
        return  new Order( myPlanetPlus.planet.id, planetAColoniser.id,  calculEnvoieColon(planetAColoniser, myPlanetPlus.planet));
    }
    else{
     return null;
    }
}


/*
Stratégie quand la planète est  en proie à une attaque
*/
var strategieProie = function(myPlanetPlus, otherPlanets){
    return null;
}


var calculEnvoieColon = function(planetAColoniser , myPlanet){
    var travelNumTurn = GameUtil.getTravelNumTurn(myPlanet,planetAColoniser);
    // nombre de colon max à envoyer pour ne pas en perdre dans l'espace 
    var colonMax = getPopulationFuture(planetAColoniser,travelNumTurn)+ PlanetPopulation.getMaxPopulation(planetAColoniser.size) - 5 ;

   return   colonMax < myPlanet.population - tailleMin ?   colonMax :  myPlanet.population - tailleMin;
  
}

var getNearestPlanet = function( source, candidatsPlus )
        {
         if(candidatsPlus[ 0 ]==null) { return source ;}
            else {
              var result = candidatsPlus[ 0 ].planet;             
                var currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) );            
               
            
                for ( key in candidatsPlus )
                {
                        var element = candidatsPlus[ key ].planet;
                        if ( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) ) )
                        {
                                currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
                                result =  element;
                        }
                        
                }
        
                return result;
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
GameUtil.getPlayerPlanetsPlus = function(planetOwnerId,planetsPlus) {
        var result = new Array();
      //  var _g1 = 0, _g = planetsPlus.length;
      for (key in planetsPlus) {
                //var i = _g1++;
                var p = planetsPlus[key];
                if(p.planet.owner.id == planetOwnerId) result.push(p);
        }
        return result;
}

/**
 * @param planetOwnerId:Number
 * @param context:Galaxy
 * @return result:Array<Planet> la liste des planetes ennemies et neutres
*/
GameUtil.getOtherPlanetsPlus = function(planetOwnerId,planetsPlus) {
        var result = new Array();
      //  var _g1 = 0, _g = planetsPlus.length;
        for (key in planetsPlus)  {
                //var i = _g1++;
                var p = planetsPlus[key];
                if(p.planet.owner.id != planetOwnerId) result.push(p);
        }
        return result;
}

GameUtil.getTravelNumTurn = function(source,target) {
	var numTurn = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / 60);
	return numTurn;
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

GameUtil.getPopulationEnnemy = function(planetOwnerId,planetsPlus){
   var result = 0;
     for (key in planetsPlus) {
                var p = planetsPlus[key];
               if((p.planet.owner.id != planetOwnerId && idEnnemy == null) || (idEnnemy != null && p.planet.owner.id == idEnnemy  )) result +=p.planet.population;
       }
       return result;
   }

GameUtil.gePopulationPlayer = function(planetOwnerId,planetsPlus){
    var result = 0;
      for (key in planetsPlus) {
 
                var p = planetsPlus[key];
                if(p.planet.owner.id == planetOwnerId) result +=p.planet.population;
        }
        return result;
 }


GameUtil.gePopulationGalaxy = function(planetOwnerId,planetsPlus){
    var result = 0;
      for (key in planetsPlus) {
                var p = planetsPlus[key];
                result +=p.planet.population;
                
          
        }
        return result;
}

GameUtil.getPlanetBySize = function(size,planetsPlus){
           var result = new Array();
      for (key in planetsPlus) {
                var p = planetsPlus[key];
                if(p.planet.size == size) result.push(p);
        }
        return result;
}



/**
* @param p1:Point
* @param p2:Point
* @return result:Number lnb tour entre deux points
*/
GameUtil.getTurnBetween = function(p1,p2) {
       return Math.ceil((Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2))) / Game.SHIP_SPEED);
}


var getBestTargetPlanet = function(source,candidatsPlus) {
          var result = getNearestPlanet(source,candidatsPlus);
  var optim = false;
               var currentDist = 1000000000;
               for ( key in candidatsPlus )
               {
                       var element = candidatsPlus[ key ].planet;
                       if (( currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )) && source.population>getPopulationFuture(element,GameUtil.getTurnBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )) )
                       {
                               currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
                            optim=true;
                               result = element;
                       }
                       
               }
    
            if(!optim){
                var planet = getNearestPlanetbySize(source,candidatsPlus,PlanetSize.SMALL);
                if(planet == null)planet = getNearestPlanetbySize(source,candidatsPlus,PlanetSize.NORMAL);
                if(planet == null)planet = getNearestPlanetbySize(source,candidatsPlus,PlanetSize.BIG);
                if(planet == null) planet = getNearestPlanetbySize(source,candidatsPlus,PlanetSize.HUGE);
                if(planet != null) result=planet;
            }
  
               return result;

}



var getNearestPlanetbySize = function( source, candidatsPlus,size )
        {
            
                
                var result = null;             
                var currentDist = 100000000;           
               
            
                for ( key in candidatsPlus )
                {
                        var element = candidatsPlus[ key ].planet;
                        if ( (currentDist > GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )) && (element.size=size) )
                        {
                                currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) );
                                result =  element;
                        }
                        
                }
        
                return result;
        }



GameUtil.iniEnnemyId =function(planetOwnerId,context){
    
   if(idEnnemy!=null) return;
      var fleet= ArrayUtils.clone(context.fleet);
       for(var i = fleet.length; i--;) {
       var ship =fleet[i];
           
       if(ship.owner.id!=planetOwnerId){
           idEnnemy=ship.owner.id;
           return;
        }
   }
}

    /**
* @param planetOwnerId:Number
* @param context:Galaxy
* @return result:Array<Planet> la liste des planetes ennemies et neutres
*/
GameUtil.getEnnemyPlanetsPlus = function(planetOwnerId,planetsPlus) {
       var result = new Array();
     //  var _g1 = 0, _g = planetsPlus.length;
       for (key in planetsPlus)  {
               //var i = _g1++;
               var p = planetsPlus[key];
               if(p.planet.owner.id == idEnnemy) result.push(p);
       }
       return result;
}


/**
* Classe utilitaire 
*/
var ArrayUtils = {} ;
/**
Methode Clone
* @param array:Array
* @return clone:Array
*/
ArrayUtils.clone = function(array){
   return array.splice(0);
}

/**
Methode Remove Item
* @param array:Array
 * @param item:object
*/
ArrayUtils.remove = function(array, item) {
  var index = array.indexOf(item);
if (index > -1) {
   array.splice(index, 1);
}
 }

/**
Methode Get Item par Valeur d'un attribut
* @param array:Array
 * @param attribut:String
 * @param value:String
 * @return item:Object
*/
ArrayUtils.get = function(array,attribut,value) {
   var key;
 for(key in array){
     if(array[key][attribut] == value) return array[key];
  }
 };



var PlanetSize = {};
PlanetSize.SMALL = 1;
PlanetSize.NORMAL = 2;
PlanetSize.BIG = 3;
PlanetSize.HUGE = 4;


