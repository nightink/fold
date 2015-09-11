'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const _ = require('lodash')
const Ioc = require('../Ioc')

/**
 * @module RegisterarHelpers
 * @description Here we write all helpers , which are state
 * independent , means they only do input and output
 * nothing else.
 */
let RegisterarHelpers = exports = module.exports = {}

/**
 * @function requireHash
 * @description Require all files inside in an array using
 * node require method and return required files as an
 * array
 * @param  {Array} hash
 * @return {Array}
 * @public
 */
RegisterarHelpers.requireHash = function (hash) {
  return _.flatten(_.map(hash, function (item) {
    return require(item)
  }))
}

/**
 * @function requireInjection
 * @description It requires a file using namespace and get path for
 * that namespace from un resolved bindings inside
 * ioc container
 * @param  {String} injection
 * @return {*}
 */
RegisterarHelpers.requireInjection = function (injection) {
  return require(Ioc.getUnResolvedProviders()[injection])
}

/**
 * @function registerDeferred
 * @description Registers deferred providers to the ioc
 * container using later method
 * @param  {Object} hash
 */
RegisterarHelpers.registerDeferred = function (hash) {
  _.each(hash, function (item, provides) {
    Ioc.later(provides, item)
  })
}

/**
 * @function getInjectionsForResolvedProviders
 * @description It returns a tree with single node representing
 * all dependencies required by resolved providers.
 * @return {Array}
 */
RegisterarHelpers.getInjectionsForResolvedProviders = function () {
  return _.flatten(_.map(Ioc.getResolvedProviders(), function (value, key) {
    return value.injections
  }))
}

/**
 * @function getAllResolvedProviders
 * @description It returns namespaces for all resolved providers so far.
 * @return {Array}
 */
RegisterarHelpers.getAllResolvedProviders = function () {
  return _.keys(Ioc.getResolvedProviders())
}

/**
 * @function getAllUnresolvedProviders
 * @description It returns namespaces for all unresolved providers.
 * @return {Array}
 */
RegisterarHelpers.getAllUnresolvedProviders = function () {
  return _.keys(Ioc.getUnResolvedProviders())
}
