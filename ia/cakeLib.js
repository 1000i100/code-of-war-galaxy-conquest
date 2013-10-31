(function() {
  var Mocha, Monitor, Q, appFileChange, chai, chaiAsPromised, coffee, compileIt, compiledFilePath, debug, delay, exec, file2path, file2string, fileExtension, fs, fs_readFile, fs_stat, fs_writeFile, glob, isNewer, justreturnContent, listDo, livereload, mkdirRecursive, mkdirp, path, pathConvertor, reloadIt, rimraf, rmAppFile, rmCompiled, rmRecursive, rmSpecFile, runTestIfChange, setGlobalOptions, spawn, specFileChange, src2build, src2buildWrapper, string2file, treeDo, unixifyPath, untestedChange, util, verbose, watch, _ref;

  fs = require('fs');

  path = require('path');

  _ref = require('child_process'), exec = _ref.exec, spawn = _ref.spawn;

  util = require('util');

  watch = require('watch');

  glob = require('glob');

  Q = require('q');

  coffee = require('coffee-script');

  mkdirp = require('mkdirp');

  Mocha = require('mocha');

  chai = require('chai');

  chaiAsPromised = require('chai-as-promised');

  rimraf = require('rimraf');

  livereload = require('livereload');

  require('colors');

  untestedChange = false;

  verbose = false;

  debug = false;

  exports.appSourceDir = '';

  exports.appCompiledDir = '';

  exports.appTestablePattern = '';

  exports.specDir = '';

  exports.specCompiledDir = '';

  exports.oneShotReporter = 'nyan';

  exports.watchReporter = 'min';

  exports.runTestDelay = 500;

  exports.reglesDeConversion = {};

  exports.aDeplacer = [];

  exports.watchTask = function(options) {
    setGlobalOptions(options);
    return Q(exports.buildTask(options)).then(function() {
      var server;
      exports.testTask(options);
      new Monitor(exports.appSourceDir, appFileChange, appFileChange, rmAppFile);
      new Monitor(exports.specDir, specFileChange, specFileChange, rmSpecFile);
      server = livereload.createServer({
        interval: exports.runTestDelay
      });
      return server.watch(path.resolve('.', exports.appCompiledDir));
    });
  };

  exports.testTask = function(options, reporter) {
    var q;
    if (reporter == null) {
      reporter = exports.oneShotReporter;
    }
    q = Q.defer();
    setGlobalOptions(options);
    if (debug) {
      util.log('Préparation des tests'.cyan);
    }
    chai.use(chaiAsPromised).should();
    treeDo(exports.appTestablePattern, reloadIt).then(function() {
      var mocha, testFilesPattern;
      mocha = new Mocha;
      mocha.reporter(reporter);
      testFilesPattern = exports.specCompiledDir + '**/*.js';
      if (debug) {
        util.log('Liste les fichiers répondant au motif '.cyan + testFilesPattern);
      }
      return glob(testFilesPattern, function(err, fileList) {
        var file, runner, _i, _len;
        for (_i = 0, _len = fileList.length; _i < _len; _i++) {
          file = fileList[_i];
          if (debug) {
            util.log('spec : '.cyan + file);
          }
          delete require.cache[path.resolve('.', file)];
          mocha.addFile(file);
        }
        if (verbose) {
          util.log('Execution des tests'.cyan);
        }
        return runner = mocha.run(function() {
          if (verbose) {
            util.log('Tests terminés'.cyan);
          }
          return q.resolve();
        });
      });
    });
    return q.promise;
  };

  exports.buildTask = function(options) {
    var q;
    q = Q.defer();
    setGlobalOptions(options);
    Q.all([exports.aDeplacer.length ? listDo(exports.aDeplacer, src2buildWrapper) : void 0, treeDo(exports.specDir + '**', compileIt, [exports.specDir, exports.specCompiledDir]), treeDo(exports.appSourceDir + '**', compileIt, [exports.appSourceDir, exports.appCompiledDir])]).done(function() {
      util.log('Compilation terminée'.cyan);
      return q.resolve();
    });
    return q.promise;
  };

  exports.cleanTask = function(options) {
    setGlobalOptions(options);
    util.log("Nétoyage du projet...".cyan);
    return Q.all([rmRecursive(exports.specCompiledDir), rmRecursive(exports.appCompiledDir)]).done(function() {
      return util.log("Nétoyage Terminé".cyan);
    });
  };

  exports.coffee2js = function(srcContent, srcFileName) {
    var q;
    q = Q.defer();
    q.resolve(coffee.compile(srcContent));
    return q.promise;
  };

  appFileChange = function(file) {
    return compileIt(file, exports.appSourceDir, exports.appCompiledDir).then(function() {
      untestedChange = true;
      return setTimeout(runTestIfChange, exports.runTestDelay);
    });
  };

  specFileChange = function(file) {
    return compileIt(file, exports.specDir, exports.specCompiledDir).then(function() {
      untestedChange = true;
      return setTimeout(runTestIfChange, exports.runTestDelay);
    });
  };

  rmSpecFile = function(file) {
    return rmCompiled(file, exports.specDir, exports.specCompiledDir).then(function() {
      untestedChange = true;
      return setTimeout(runTestIfChange, exports.runTestDelay);
    });
  };

  rmAppFile = function(file) {
    return rmCompiled(file).then(function() {
      untestedChange = true;
      return setTimeout(runTestIfChange, exports.runTestDelay);
    });
  };

  treeDo = function(scanPattern, action, actionParamTab) {
    var actionName, q;
    if (actionParamTab == null) {
      actionParamTab = [];
    }
    q = Q.defer();
    actionName = (action + '').split('{')[0];
    if (debug) {
      util.log('execute '.yellow + actionName + ' sur chaque fichiers répondant au motif : '.yellow + scanPattern);
    }
    glob(scanPattern, function(err, fileList) {
      var promesse;
      if (err) {
        q.reject(err);
      }
      if (fileList.length) {
        promesse = listDo(fileList, action, actionParamTab);
        return promesse.then(function() {
          return q.resolve(actionName);
        });
      } else {
        return q.reject('no file matching this pattern : ' + scanPattern);
      }
    });
    return q.promise;
  };

  listDo = function(theList, action, actionParamTab) {
    var actionName, i, index, params, promesse, q, _i, _j, _ref1, _ref2;
    if (actionParamTab == null) {
      actionParamTab = [];
    }
    q = Q.defer();
    actionName = (action + '').split('{')[0];
    if (debug) {
      util.log('execute '.yellow + actionName + ' sur chaque élément de la liste fournie.'.yellow);
    }
    promesse = [];
    for (index = _i = 0, _ref1 = theList.length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
      params = [theList[index]];
      for (i = _j = 0, _ref2 = actionParamTab.length - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
        params.push(actionParamTab[i]);
      }
      promesse.push(action.apply(null, params));
    }
    Q.all(promesse).then(function() {
      return q.resolve(actionName);
    });
    return q.promise;
  };

  reloadIt = function(file) {
    var q;
    q = Q.defer();
    file = path.resolve('.', file);
    delete require.cache[file];
    require(file);
    if (debug) {
      util.log(file + ' rechargé'.yellow);
    }
    q.resolve(file);
    return q.promise;
  };

  compileIt = function(srcFile, originFolder, destinationFolder) {
    var compiledFile;
    if (originFolder == null) {
      originFolder = exports.appSourceDir;
    }
    if (destinationFolder == null) {
      destinationFolder = exports.appCompiledDir;
    }
    compiledFile = compiledFilePath(srcFile, originFolder, destinationFolder);
    return src2build(srcFile, compiledFile);
  };

  src2build = function(srcFile, compiledFile) {
    var conversion, fileType;
    fileType = fileExtension(srcFile);
    if (exports.reglesDeConversion[fileType]) {
      conversion = exports.reglesDeConversion[fileType];
    }
    return isNewer(srcFile, compiledFile).then(function(res) {
      if (!res) {
        if (debug) {
          return util.log(compiledFile + ' déjà à jour'.grey);
        }
      } else {
        if (verbose) {
          util.log('Compile '.yellow + srcFile + ' to '.yellow + compiledFile);
        }
        return file2string(srcFile).then(function(res) {
          var promesse, srcContent;
          srcContent = res;
          if (conversion) {
            promesse = conversion.func(srcContent, srcFile);
          } else {
            promesse = justreturnContent(srcContent);
          }
          return promesse.then(function(compiledContent) {
            return string2file(compiledFile, compiledContent);
          });
        });
      }
    });
  };

  src2buildWrapper = function(fromToTab) {
    return src2build(fromToTab[0], fromToTab[1]);
  };

  rmCompiled = function(srcFile, originFolder, destinationFolder) {
    var compiledFile;
    if (originFolder == null) {
      originFolder = exports.appSourceDir;
    }
    if (destinationFolder == null) {
      destinationFolder = exports.appCompiledDir;
    }
    compiledFile = compiledFilePath(srcFile, originFolder, destinationFolder);
    return rmRecursive(compiledFile);
  };

  Monitor = function(folder, changeCallBack, newCallBack, rmCallBack) {
    this.lastStamp = 'static var';
    this.lastFileList = [];
    return watch.watchTree(folder, function(file, curr, prev) {
      if (this.lastStamp !== (new Date).toLocaleTimeString()) {
        this.lastFileList = [];
      }
      this.lastStamp = (new Date).toLocaleTimeString();
      if (prev === null && curr === null && file instanceof Object) {
        if (debug) {
          return util.log("Finished walking ".cyan + folder + " tree".cyan);
        }
      } else {
        if (lastFileList[file]) {
          if (debug) {
            util.log(('echo ' + file).grey);
          }
        } else {
          if (prev === null) {
            if (verbose) {
              util.log('new '.green + file);
            }
            newCallBack(file);
          } else if (curr.nlink === 0) {
            if (verbose) {
              util.log('rm '.red + file);
            }
            rmCallBack(file);
          } else {
            if (verbose) {
              util.log('change '.yellow + file);
            }
            changeCallBack(file);
          }
        }
        return this.lastFileList[file] = true;
      }
    });
  };

  setGlobalOptions = function(options) {
    if (options) {
      if (options.verbose) {
        verbose = true;
      }
      if (options.veryverbose) {
        verbose = true;
        return debug = true;
      }
    }
  };

  isNewer = function(file1, file2) {
    var q;
    q = Q.defer();
    Q.allSettled([fs_stat(file1), fs_stat(file2)]).then(function(res) {
      var file1Time, file2Time;
      if (res[0].state === "fulfilled") {
        file1Time = res[0].value.mtime.getTime();
      } else {
        file1Time = 0;
      }
      if (res[1].state === "fulfilled") {
        file2Time = res[1].value.mtime.getTime();
      } else {
        file2Time = 0;
      }
      if (!file1Time && !file2Time) {
        q.reject(res[0].reason);
      }
      return q.resolve(file1Time > file2Time);
    });
    return q.promise;
  };

  file2string = function(file, encoding) {
    if (encoding == null) {
      encoding = 'utf8';
    }
    return fs_readFile(file, encoding);
  };

  string2file = function(file, string) {
    var filePath;
    filePath = file2path(file);
    return mkdirRecursive(filePath).then(function() {
      return fs_writeFile(file, string);
    });
  };

  justreturnContent = function(srcContent) {
    var q;
    q = Q.defer();
    q.resolve(srcContent);
    return q.promise;
  };

  fileExtension = function(file) {
    var tmp;
    tmp = file.split('.');
    return tmp[tmp.length - 1];
  };

  compiledFilePath = function(srcFile, originFolder, destinationFolder) {
    var compiledFile, conversion, fileType;
    if (originFolder == null) {
      originFolder = exports.appSourceDir;
    }
    if (destinationFolder == null) {
      destinationFolder = exports.appCompiledDir;
    }
    fileType = fileExtension(srcFile);
    if (exports.reglesDeConversion[fileType]) {
      conversion = exports.reglesDeConversion[fileType];
      compiledFile = pathConvertor(srcFile, originFolder, destinationFolder, fileType, conversion.finalType);
    } else {
      compiledFile = pathConvertor(srcFile, originFolder, destinationFolder);
    }
    return compiledFile;
  };

  pathConvertor = function(oldPath, originFolder, destinationFolder, originFileType, destinationFileType) {
    var newPath, pattern;
    if (originFileType == null) {
      originFileType = '';
    }
    if (destinationFileType == null) {
      destinationFileType = '';
    }
    newPath = unixifyPath(oldPath).replace(originFolder, destinationFolder);
    if (originFileType) {
      pattern = new RegExp('.' + originFileType + '$', 'i');
      newPath = newPath.replace(pattern, '.' + destinationFileType);
      if (debug) {
        util.log("regexp de changement d'extension : ".cyan + pattern + ' -> '.cyan + '.' + destinationFileType);
      }
    }
    return newPath;
  };

  unixifyPath = function(oldPath) {
    return oldPath.replace(/\\/g, '/');
  };

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  fs_stat = function(file) {
    var q;
    q = Q.defer();
    fs.stat(file, function(err, stat) {
      if (err) {
        q.reject(err);
      }
      return q.resolve(stat);
    });
    return q.promise;
  };

  fs_readFile = function(file, encoding) {
    var q;
    if (encoding == null) {
      encoding = 'utf8';
    }
    q = Q.defer();
    fs.readFile(file, encoding, function(err, data) {
      if (err) {
        q.reject(err);
      }
      return q.resolve(data);
    });
    return q.promise;
  };

  fs_writeFile = function(file, string) {
    var q;
    q = Q.defer();
    fs.writeFile(file, string, function(err) {
      if (err) {
        q.reject(err);
      }
      return q.resolve();
    });
    return q.promise;
  };

  file2path = function(file) {
    var filePath;
    filePath = file.split('/');
    filePath.pop();
    return filePath.join('/');
  };

  rmRecursive = function(folder) {
    var q;
    q = Q.defer();
    rimraf(folder, function(err) {
      if (err) {
        return q.reject(err);
      } else {
        if (verbose) {
          util.log(folder + ' supprimé'.yellow);
        }
        return q.resolve();
      }
    });
    return q.promise;
  };

  mkdirRecursive = function(folder) {
    var q;
    q = Q.defer();
    mkdirp(folder, function(err) {
      if (err) {
        q.reject(err);
      }
      return q.resolve();
    });
    return q.promise;
  };

  runTestIfChange = function() {
    if (untestedChange) {
      untestedChange = false;
      return exports.testTask(null, exports.watchReporter);
    }
  };

}).call(this);
