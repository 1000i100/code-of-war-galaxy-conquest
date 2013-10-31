
cl										= require './src/cakeLib'

#config
cl.appSourceDir				= 'src/'
cl.appCompiledDir			= 'ia/'
cl.appTestablePattern	= cl.appCompiledDir + 'ia.js' #'lib/'
cl.specDir						= 'test/'
cl.specCompiledDir		= 'ia/test/'


# formats géré
cl.reglesDeConversion =
	coffee:
		func: cl.coffee2js
		finalType: 'js'


option '-v', '--verbose', 'affichage détaillé'
option '-V', '--veryverbose', 'affichage très détaillé (debug)'

task 'watch', "A chaque changement sauvegardé, recompile les fichiers concernés et exécute les tests".cyan, (options)->
	cl.watchTask options
task "test", "exécute les tests".cyan, (options)->
	cl.testTask options
task 'build', 'compile tous les fichiers des dossiers '.cyan + cl.appSourceDir + ' dans '.cyan + cl.appCompiledDir + ' et '.cyan + cl.specDir + ' dans '.cyan + cl.specCompiledDir, (options)->
	cl.buildTask options
task "clean", "supprime les dossiers ".cyan + cl.specDir + ' et '.cyan + cl.appSourceDir, (options)->
	cl.cleanTask options
