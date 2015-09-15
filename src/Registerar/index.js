'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const _ = require('lodash')
const helpers = require('./helpers')
const Loader = require('../Loader')
const Ioc = require('../Ioc')
const iocHelpers = require('../Ioc/helpers')
const Q = require('q')

let Registerar = exports = module.exports = {}

/**
 * @function register
 * @description Here we register all the service
 * providers and resolve them until DI cycle
 * is stable.
 * @param  {Array} hash  Array of providers
 * @public
 */
Registerar.register = function (hash, deferredHash) {
  return new Promise(function (resolve, reject) {
    helpers.registerDeferred(deferredHash)
    let loadedProviders = helpers.requireHash(hash)
    let instances = []
    loadedProviders.forEach(function (provider) {
      instances.push(iocHelpers.registerProvider(provider))
    })

    Q
    .all(instances)
    .then(function () {
      return Registerar.stableizeCycle()
    }).then(resolve).catch(reject)

  })
}

/**
 * @function stableizeCycle
 * @description here to make sure all required injections are stable
 * before we return final fulfilled promise
 * @return {Promise}
 * @public
 */
Registerar.stableizeCycle = function () {
  let resolvedProvidersInjections = helpers.getInjectionsForResolvedProviders()
  let resolvedInjections = helpers.getAllResolvedProviders()
  let unResolvedInjections = helpers.getAllUnresolvedProviders()
  let yetToBeResolved = _.difference(resolvedProvidersInjections, resolvedInjections)
  let toBeResolvedFromDeferred = _.intersection(unResolvedInjections, yetToBeResolved)

  let instances = []
  toBeResolvedFromDeferred.forEach(function (injection) {
    let provider = helpers.requireInjection(injection)
    instances.push(iocHelpers.registerProvider(provider))
  })
  return Q.all(instances)
}

/**
 * @function autoload
 * @description Generates directory hash with key/value pairs
 * where key is the name of the class and value is path to
 * directory. It only registers es6 classes and functions
 * @param  {path} directory
 * @param  {Function} cb
 * @param {String} basePath
 * @param {String} rootNamespace
 * @return {Promise<fulfilled>}
 * @public
 */
Registerar.autoload = function (directory, basePath, rootNamespace) {
  return new Promise(function (resolve, reject) {
    Loader
      .generateDirectoryHash(directory, basePath, rootNamespace)
      .then(function (hash) {
        _.each(hash, function (item, index) {
          Ioc.dump(index, item)
        })
        resolve()
      })
      .then(reject)
  })
}

/**
 * @function dump
 * @description Generates directory hash with key/value pairs
 * where key is the name of the class and value is path to
 * directory and dumps it to a given file.
 * @param  {path} directory
 * @param  {Function} cb
 * @param {String} basePath
 * @param {String} rootNamespace
 * @return {Promise<fulfilled>}
 * @public
 */
Registerar.dump = function (directory, basePath, rootNamespace) {
  return new Promise(function (resolve, reject) {
    Loader
      .generateDirectoryHash(directory, basePath, rootNamespace)
      .then(Loader.saveDirectoryDump)
      .then(resolve)
      .then(reject)
  })
}
