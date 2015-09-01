'use strict'

const _ = require('lodash')
const helpers = require('./helpers')
const Loader = require('../Loader')
const iocHelpers = require('../Ioc/helpers')
const Q = require('q')

let Registerar = exports = module.exports = {}

/**
 * @function register
 * @description Here we register all the service
 * providers and resolve them until DI cycle
 * is stable.
 * @param  {Array} hash  Array of providers
 */
Registerar.register = function (hash, deferredHash) {
  return new Promise(function (resolve, reject) {
    helpers.register_deferred(deferredHash)
    let loadedProviders = helpers.require_hash(hash)
    let instances = Q()
    loadedProviders.forEach(function (provider) {
      instances = instances.then(iocHelpers.register_provider.bind(null, provider))
    })
    instances.then(function () {
      return Registerar.stableizeCycle()
    }).then(resolve).catch(reject)
  })
}

Registerar.stableizeCycle = function () {
  let resolvedProvidersInjections = helpers.get_injections_for_resolved_providers()
  let resolvedInjections = helpers.get_all_resolved_providers()
  let unResolvedInjections = helpers.get_all_unresolved_providers()
  let yetToBeResolved = _.difference(resolvedProvidersInjections, resolvedInjections)
  let toBeResolvedFromDeferred = _.intersection(unResolvedInjections, yetToBeResolved)

  let instances = Q()
  toBeResolvedFromDeferred.forEach(function (injection) {
    let provider = helpers.require_injection(injection)
    instances = instances.then(iocHelpers.register_provider.bind(null, provider))
  })
  return instances
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
 */
Registerar.autoload = function (directory, basePath, rootNamespace) {
  process.env.foldNamespace = rootNamespace
  return new Promise(function (resolve, reject) {
    Loader
      .generate_directory_hash(directory, basePath, rootNamespace)
      .then(Loader.save_directory_dump)
      .then(resolve)
      .then(reject)
  })
}
