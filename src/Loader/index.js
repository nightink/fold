'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const LoaderException = require('../Exception/loader')
const logger = require('../../utils/logger')
const walk = require('walk')
const fs = require('fs')
const path = require('path')

/**
 * @module Loader
 * @description Loader module is responsible for determining binding type
 * and resolving module based upon type
 */
let Loader = exports = module.exports = {}

/**
 * @function require
 * @description tries to load a module using node require method
 * and throws custom exception if unable to load one
 * @param  {String} module
 * @return {*}
 * @public
 */
Loader.require = function (module) {
  try {
    return require(module)
  } catch(e) {
    /**
     * if error is a syntax error, parse file again to
     * see check for error. v8 sucks here.
     */
    if(e.name === 'SyntaxError'){
      const filename = require.resolve(module)
      const check = require('syntax-error');
      var src = fs.readFileSync(filename);
      var err = check(src,filename);
      throw new Error(err)
    }
    throw e
  }
}

/**
 * @function resolve
 * @description tries to get resolved binding from ioc container
 * ornthrows an exception if unable to find one
 * @param  {Object} bindings
 * @param  {String} module
 * @return {*}
 * @public
 */
Loader.resolve = function (bindings, module) {
  logger.verbose('Fetching provider %s', module)
  if (!bindings[module]) {
    throw new LoaderException(`Unable to resolve ${module} inside container`)
  }
  return bindings[module]
}

/**
 * @function resolveUsingType
 * @description tries to resolve injection using it's type
 * or throws a custom exception
 * @param  {Object} bindings
 * @param  {Object} dump
 * @param  {String} injection
 * @param  {String} type
 * @return {*}
 * @public
 */
Loader.resolveUsingType = function (bindings, unresolvedBindings, aliases, dump, dumpBasePath, dumpNamespace, injection, type) {
  let instance = null
  injection = aliases[injection] || injection

  switch (type) {
    case 'PROVIDER':
      instance = Loader.resolve(bindings, injection)
      break
    case 'UNRESOLVED_PROVIDER':
      instance = unresolvedBindings[injection]
      break
    case 'LOCAL_MODULE':
      if(dump[injection]){
        instance = Loader.require(dump[injection])
      }else{
        instance = Loader._makeDump(injection,dumpBasePath,dumpNamespace)
      }
      break
    case 'NPM_MODULE':
      instance = Loader.require(injection)
      break
  }
  if (!instance) {
    throw new LoaderException(`Invalid injection type : ${type}`)
  }
  return instance
}

/**
 * @function returnInjectionType
 * @description Determines type of injection
 * @param  {Object} bindings
 * @param  {Object} dump
 * @param  {String} injection
 * @return {String}
 * @public
 */
Loader.returnInjectionType = function (bindings, unresolvedBindings, aliases, dump, dumpBasePath, dumpNamespace, injection) {
  injection = aliases[injection] || injection
  if (bindings[injection]) {
    return 'PROVIDER'
  }else if (unresolvedBindings[injection]) {
    return 'UNRESOLVED_PROVIDER'
  }else if (dump[injection]) {
    return 'LOCAL_MODULE'
  }else if(Loader._isDump(dumpNamespace,injection)) {
    logger.verbose('Assumed %s is an autoload path', injection)
    return 'LOCAL_MODULE'
  }else {
    return 'NPM_MODULE'
  }
}

/**
 * @function isDump
 * @description Try to figure out whether is it a
 * dump path or not.
 * @param  {String}  namespace
 * @param  {String}  injection
 * @return {Boolean}
 */
Loader._isDump = function(namespace,injection){
  return injection.startsWith(namespace)
}

/**
 * @function _makeDump
 * @description it makes path to local module using namespace and
 * require it
 * @param  {String} injection
 * @param  {String} basePath
 * @param  {String} namespace
 * @return {*}
 */
Loader._makeDump = function (injection,basePath,namespace) {
  const incrmentalPath = injection.replace(namespace,'')
  const modulePath = path.join(basePath,incrmentalPath)
  return Loader.require(modulePath)
}

/**
 * @function generateDirectoryHash
 * @description Generates directory hash with key/value pairs
 * where key is the name of the class and value is path to
 * directory. It only registers es6 classes and functions
 * @param  {path} directory
 * @param  {Function} cb
 * @param {String} basePath
 * @param {String} rootNamespace
 * @return {Object}
 * @public
 */
Loader.generateDirectoryHash = function (directory, basePath, rootNamespace) {
  const walker = walk.walk(directory)
  let hash = {}

  return new Promise(function (resolve, reject) {
    /*
    |--------------------------------------------------------------------------
    |   Walking
    |--------------------------------------------------------------------------
    |
    |   Here we walk through all the files and make sure returned file
    |   should have a name and is a .js file , if conditions are true
    |   we make a namespace out of their path and store it as a key
    |   value pair.
    |
    */
    walker.on('file', function (parent, file, next) {
      const extension = typeof (file.name) !== 'undefined' ? file.name.split('.').pop() : ''
      if (extension === 'js') {
        const modulePath = `${parent}/${file.name}`
        const namespace = modulePath.replace(basePath, rootNamespace).replace('.js', '')
        hash[namespace] = modulePath
      }
      next()
    })

    /*
    |--------------------------------------------------------------------------
    |   On Errors
    |--------------------------------------------------------------------------
    |
    |   When a error event occurs , we simply return the callback saying
    |   error happened.
    |
    */
    walker.on('errors', function (error) {
      reject(error)
    })

    /*
    |--------------------------------------------------------------------------
    |   On End
    |--------------------------------------------------------------------------
    |
    |   If all was good , call callback and return hash generated while
    |   walking through the files
    |
    */
    walker.on('end', function () {
      resolve(hash)
    })
  })
}

/**
 * @function saveDirectoryDump
 * @description here we simply convert directory map into a string
 * using JSON.stringify and save it as node module.
 * @param  {Object} hash
 * @return {Promise<fulfilled>}
 * @public
 */
Loader.saveDirectoryDump = function (hash) {
  hash = JSON.stringify(hash, null, 2)
  hash = `module.exports = ${hash}`

  return new Promise(function (resolve, reject) {
    fs.writeFile(path.join(__dirname, '../../dump/hash.js'), hash, function (err, done) {
      if (err) reject(err)
      else resolve()
    })
  })
}
