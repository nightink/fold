'use strict'

const LoaderException = require('../Exception/loader')
const walk = require('walk')
const fs = require('fs')
const path = require('path')

/**
 * @module Loader
 * @description Loader module is responsible for determining binding type
 * and resolving module based upon type
 * @author Harminder Virk
 */
let Loader = exports = module.exports = {}

/**
 * @function require
 * @description tries to load a module using node require method
 * and throws custom exception if unable to load one
 * @param  {String} module
 * @return {*}
 */
Loader.require = function (module) {
  try {
    return require(module)
  } catch(e) {
    throw new LoaderException(`Unable to require module ${module}`)
  }
}

/**
 * @function resolve
 * @description tries to get resolved binding from ioc container
 * ornthrows an exception if unable to find one
 * @param  {Object} bindings
 * @param  {String} module
 * @return {*}
 */
Loader.resolve = function (bindings, module) {
  if (!bindings[module]) {
    throw new LoaderException(`Unable to resolve ${module} inside container`)
  }
  return bindings[module]
}

/**
 * @function resolve_using_type
 * @description tries to resolve injection using it's type
 * or throws a custom exception
 * @param  {Object} bindings
 * @param  {Object} dump
 * @param  {String} injection
 * @param  {String} type
 * @return {*}
 */
Loader.resolve_using_type = function (bindings, unresolvedBindings, aliases, dump, injection, type) {
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
      instance = Loader.require(dump[injection])
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
 * @function return_injection_type
 * @description Determines type of injection
 * @param  {Object} bindings
 * @param  {Object} dump
 * @param  {String} injection
 * @return {String}
 */
Loader.return_injection_type = function (bindings, unresolvedBindings, aliases, dump, injection) {
  injection = aliases[injection] || injection
  if (bindings[injection]) {
    return 'PROVIDER'
  }else if (dump[injection]) {
    return 'LOCAL_MODULE'
  } else if (unresolvedBindings[injection]) {
    return 'UNRESOLVED_PROVIDER'
  } else {
    return 'NPM_MODULE'
  }
}

/**
 * @function generate_directory_hash
 * @description Generates directory hash with key/value pairs
 * where key is the name of the class and value is path to
 * directory. It only registers es6 classes and functions
 * @param  {path} directory
 * @param  {Function} cb
 * @param {String} basePath
 * @param {String} rootNamespace
 * @return {Object}
 */
Loader.generate_directory_hash = function (directory, basePath, rootNamespace) {
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
 * @function save_directory_dump
 * @description here we simply convert directory map into a string
 * using JSON.stringify and save it as node module.
 * @param  {Object} hash
 * @return {Promise<fulfilled>}
 */
Loader.save_directory_dump = function (hash) {
  hash = JSON.stringify(hash, null, 2)
  hash = `module.exports = ${hash}`

  return new Promise(function (resolve, reject) {
    fs.writeFile(path.join(__dirname, '../../dump/hash.js'), hash, function (err, done) {
      if (err) reject(err)
      else resolve()
    })
  })
}
