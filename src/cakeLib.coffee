fs							= require 'fs'
path						= require 'path'
{exec,spawn}		= require 'child_process'
util						= require 'util'
watch						= require 'watch'
glob						= require 'glob'
Q								= require 'q'
coffee					= require 'coffee-script'
mkdirp					= require 'mkdirp'
Mocha						= require 'mocha'
chai						= require 'chai'
chaiAsPromised	= require 'chai-as-promised'
rimraf					= require 'rimraf'
livereload			= require 'livereload'
UglifyJS				= require 'uglify-js'
require 'colors'

# internal globals
untestedChange = false
verbose = false
debug = false


#config
exports.appSourceDir				= ''
exports.appCompiledDir			= ''
exports.appTestablePattern	= '' # motif de sélection des fichiers contenant le code métier à recharger avant chaque execution de test.
exports.specDir							= ''
exports.specCompiledDir			= ''
exports.oneShotReporter			= 'nyan' #"progress"
exports.watchReporter				= 'min' #"dot"
exports.runTestDelay				= 500 # latence entre la détection d'un fichier modifié et l'execution des test (pour éviter les test en cascade lors des enregistrement de masse)
exports.reglesDeConversion	= {}
exports.aDeplacer						= []


exports.watchTask = (options)->
	setGlobalOptions options
	Q(exports.buildTask options).then ->
		exports.testTask options
		new Monitor(exports.appSourceDir,appFileChange,appFileChange,rmAppFile)
		new Monitor(exports.specDir,specFileChange,specFileChange,rmSpecFile)
		server = livereload.createServer({interval:exports.runTestDelay})
		server.watch path.resolve '.',exports.appCompiledDir


exports.testTask = (options, reporter=exports.oneShotReporter)->
	q = Q.defer()
	setGlobalOptions options
	util.log 'Préparation des tests'.cyan if debug
	chai.use(chaiAsPromised).should()
	treeDo(exports.appTestablePattern, reloadIt).then ->
		mocha = new Mocha
		mocha.reporter reporter
		testFilesPattern = exports.specCompiledDir+'**/*.js'
		util.log 'Liste les fichiers répondant au motif '.cyan + testFilesPattern if debug
		glob testFilesPattern, (err, fileList)->
			for file in fileList
				util.log 'spec : '.cyan + file if debug
				delete require.cache[path.resolve('.', file)] # chemin absolue nécessaire
				mocha.addFile file
			util.log 'Execution des tests'.cyan if verbose
			runner = mocha.run ->
				util.log 'Tests terminés'.cyan if verbose
				q.resolve()
	q.promise

exports.buildTask = (options)->
	q = Q.defer()
	setGlobalOptions options
	Q.all([
		listDo exports.aDeplacer, src2buildWrapper if exports.aDeplacer.length
		treeDo exports.specDir+'**', compileIt, [exports.specDir, exports.specCompiledDir]
		treeDo exports.appSourceDir+'**', compileIt, [exports.appSourceDir, exports.appCompiledDir]
	]).done ->
		util.log 'Compilation terminée'.cyan
		q.resolve()
	q.promise

exports.cleanTask = (options)->
	setGlobalOptions options
	util.log "Nétoyage du projet...".cyan
	Q.all([
		rmRecursive exports.specCompiledDir
		rmRecursive exports.appCompiledDir
	]).done ->
		util.log "Nétoyage Terminé".cyan

exports.coffee2js = (srcContent, srcFileName) ->
	q = Q.defer()
	jsStr = coffee.compile srcContent
	jsStr = UglifyJS.minify(jsStr+'',{fromString: true}).code
	q.resolve jsStr
	q.promise

appFileChange = (file) ->
	# recompiler puis lancer les test
	compileIt(file, exports.appSourceDir, exports.appCompiledDir).then ->
		untestedChange = true
		setTimeout runTestIfChange, exports.runTestDelay
specFileChange = (file) ->
	# recompiler puis lancer les test
	compileIt(file, exports.specDir, exports.specCompiledDir).then ->
		untestedChange = true
		setTimeout runTestIfChange, exports.runTestDelay
rmSpecFile = (file) ->
	# supprimer la version compiler puis lancer les test
	rmCompiled(file, exports.specDir, exports.specCompiledDir).then ->
		untestedChange = true
		setTimeout runTestIfChange, exports.runTestDelay
rmAppFile = (file) ->
	# supprimer la version compiler puis lancer les test
	rmCompiled(file).then ->
		untestedChange = true
		setTimeout runTestIfChange, exports.runTestDelay

treeDo = (scanPattern, action, actionParamTab=[]) ->
	q = Q.defer()
	actionName = (action+'').split('{')[0]
	util.log 'execute '.yellow + actionName + ' sur chaque fichiers répondant au motif : '.yellow + scanPattern if debug
	glob scanPattern, (err, fileList)->
		q.reject err if err
		if fileList.length
			promesse = listDo fileList, action, actionParamTab
			promesse.then ->
				q.resolve actionName
		else q.reject 'no file matching this pattern : '+ scanPattern
	q.promise

listDo = (theList, action, actionParamTab=[]) ->
	q = Q.defer()
	actionName = (action+'').split('{')[0]
	util.log 'execute '.yellow + actionName + ' sur chaque élément de la liste fournie.'.yellow if debug
	promesse = []
	for index in [0..theList.length-1]
		params = [theList[index]]
		# clonning actionParamTab
		for i in [0..actionParamTab.length-1]
			params.push actionParamTab[i]
		# queing actions
		promesse.push action.apply null, params
	Q.all(promesse).then ->
		q.resolve actionName
	q.promise

reloadIt = (file) ->
	q = Q.defer()
	file = path.resolve '.', file
	delete require.cache[file]
	require file
	util.log file + ' rechargé'.yellow if debug
	q.resolve file
	q.promise

compileIt = (srcFile, originFolder=exports.appSourceDir, destinationFolder=exports.appCompiledDir) ->
	compiledFile = compiledFilePath(srcFile, originFolder, destinationFolder)
	src2build srcFile, compiledFile
src2build = (srcFile,compiledFile)->
	#path.extname file
	fileType = fileExtension srcFile
	if exports.reglesDeConversion[fileType] # s'il y a changement d'extension
		conversion = exports.reglesDeConversion[fileType]

	# on n'intervient que si l'original est plus récent que le fichier en sortie
	isNewer(srcFile,compiledFile).then (res)->
		if !res
			util.log compiledFile + ' déjà à jour'.grey if debug
		else
			util.log 'Compile '.yellow + srcFile + ' to '.yellow + compiledFile if verbose
			file2string(srcFile).then (res)->
				srcContent = res
				if conversion # s'il y a un traitement spécifique pour ce format
					promesse = conversion.func srcContent, srcFile # on compile
				else
					promesse = justreturnContent srcContent
				promesse.then (compiledContent) ->
					string2file compiledFile, compiledContent

src2buildWrapper = (fromToTab) ->
	src2build  fromToTab[0],fromToTab[1]

rmCompiled = (srcFile, originFolder=exports.appSourceDir, destinationFolder=exports.appCompiledDir) ->
	compiledFile = compiledFilePath(srcFile, originFolder, destinationFolder)
	rmRecursive(compiledFile)

Monitor = (folder, changeCallBack, newCallBack, rmCallBack) ->
	this.lastStamp = 'static var'
	this.lastFileList = []
	watch.watchTree folder, (file, curr, prev) ->
		this.lastFileList = [] if this.lastStamp isnt (new Date).toLocaleTimeString()
		this.lastStamp = (new Date).toLocaleTimeString()
		if prev is null and curr is null and file instanceof Object
			util.log "Finished walking ".cyan + folder + " tree".cyan if debug
		else
			if lastFileList[file]
				util.log ('echo '+file).grey if debug
			else
				if prev is null
					util.log 'new '.green + file if verbose
					newCallBack(file)
				else if curr.nlink is 0
					util.log 'rm '.red + file if verbose
					rmCallBack(file)
				else
					util.log 'change '.yellow + file if verbose
					changeCallBack(file)
			this.lastFileList[file]=true

setGlobalOptions = (options) ->
	if options
		if options.verbose then verbose = true
		if options.veryverbose
			verbose = true
			debug = true
isNewer = (file1, file2) ->
	# si seul un fichier existe il est considéré comme le plus récent
	q = Q.defer()

	Q.allSettled([
		fs_stat file1
		fs_stat file2
	]).then (res)->
		if res[0].state is "fulfilled"
			file1Time = res[0].value.mtime.getTime()
		else
			file1Time = 0
		if res[1].state is "fulfilled"
			file2Time = res[1].value.mtime.getTime()
		else
			file2Time = 0
		if !file1Time and !file2Time
			q.reject res[0].reason
		q.resolve file1Time>file2Time
	q.promise
file2string = (file, encoding='utf8') -> fs_readFile file, encoding
string2file = (file, string) ->
	filePath = file2path file
	mkdirRecursive(filePath).then ->
		fs_writeFile(file, string)
justreturnContent = (srcContent)->
	q = Q.defer()
	q.resolve srcContent
	q.promise
fileExtension = (file)->
	tmp = file.split('.')
	tmp[tmp.length-1]
compiledFilePath = (srcFile, originFolder=exports.appSourceDir, destinationFolder=exports.appCompiledDir) ->
	fileType = fileExtension srcFile
	# determination du nom de fichier en sortie
	if exports.reglesDeConversion[fileType] # s'il y a changement d'extension
		conversion = exports.reglesDeConversion[fileType]
		compiledFile = pathConvertor(srcFile, originFolder, destinationFolder, fileType, conversion.finalType)
	else
		compiledFile = pathConvertor(srcFile, originFolder, destinationFolder)
	compiledFile
pathConvertor = (oldPath, originFolder, destinationFolder, originFileType='', destinationFileType='')->
	newPath = unixifyPath(oldPath).replace(originFolder, destinationFolder)
	if originFileType
		pattern = new RegExp '.'+originFileType+'$', 'i'
		newPath = newPath.replace(pattern, '.'+destinationFileType)
		util.log "regexp de changement d'extension : ".cyan+pattern+' -> '.cyan+'.'+destinationFileType if debug
	newPath
unixifyPath = (oldPath)->
	oldPath.replace(/\\/g,'/')
	# correction de la coloration syntaxique de sublime text 2 '
delay = (ms, func) -> setTimeout func, ms
fs_stat = (file)->
	q = Q.defer()
	fs.stat file, (err, stat)->
		q.reject err if err
		q.resolve stat
	q.promise
fs_readFile = (file, encoding='utf8') ->
	q = Q.defer()
	fs.readFile file, encoding, (err, data) ->
		q.reject err if err
		q.resolve data
	q.promise
fs_writeFile = (file, string) ->
	q = Q.defer()
	fs.writeFile file, string, (err) ->
		q.reject err if err
		q.resolve()
	q.promise
file2path = (file) ->
	# extract path from path+filename
	filePath = file.split('/')
	filePath.pop()
	filePath.join('/')
rmRecursive = (folder)->
	q = Q.defer()
	rimraf folder, (err)->
		if err
			q.reject err
		else
			util.log folder + ' supprimé'.yellow if verbose
			q.resolve()
	q.promise
mkdirRecursive = (folder)->
	q = Q.defer()
	mkdirp folder, (err)->
		q.reject err if err
		q.resolve()
	q.promise

runTestIfChange = ->
	if untestedChange
		untestedChange = false
		exports.testTask null, exports.watchReporter
