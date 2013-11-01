color = 0 #  couleur d'affichage
debugMessage="" # message de debugage utilisé par le systeme et affiché dans la trace à chaque tour du combat
id = 0 # Id de l'IA

@onmessage = (event) ->
	if event.data?
		turnMessage = event.data
		id = turnMessage.playerId
		postMessage( new TurnResult( getOrders(turnMessage.galaxy), debugMessage) )
	else postMessage("data null")

getOrders = (context) ->
	return [];

class TurnMessage
	constructor: (@playerId,@galaxy) ->

###
  @internal model
###
class TurnResult
	constructor: (@orders,@consoleMessage = "") ->
		@error = ""


class UID
	@lastUID : 0
	@get : () ->
		UID.lastUID++
		return UID.lastUID
