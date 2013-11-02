@onmessage = (event) ->
	if event.data?
		postMessage( {orders:[],consoleMessage:'Zzz',error:''})
	else postMessage("data null")
