'use strict'

const _ = require('lodash')
const Ioc = require('../Ioc')

/**
 * @module RegisterarHelpers
 * @description Here we write all helpers , which are state
 * independent , means they only do input and output
 * nothing else.
 * @type {Object}
 */
let RegisterarHelpers = exports = module.exports = {}

/**
 * @function require_hash
 * @description Require all files inside in an array using
 * node require method and return required files as an
 * array
 * @param  {Array} hash
 * @return {Array}
 */
RegisterarHelpers.require_hash = function(hash){
  return _.flatten(_.map(hash,function(item){
    return require(item)
  }))
}

/**
 * @function require_injection
 * @description It requires a file using namespace and get path for
 * that namespace from un resolved bindings inside
 * ioc container
 * @param  {String} injection
 * @return {*}
 */
RegisterarHelpers.require_injection = function(injection){
  return require(Ioc.getUnResolvedProviders()[injection])
}

/**
 * @function register_deferred
 * @description Registers deferred providers to the ioc
 * container using later method
 * @param  {Object} hash
 */
RegisterarHelpers.register_deferred = function(hash){
  _.each(hash,function(item,provides){
    Ioc.later(provides,item)
  })
}

/**
 * @function get_injections_for_resolved_providers
 * @description It returns a tree with single node representing
 * all dependencies required by resolved providers.
 * @return {Array}
 */
RegisterarHelpers.get_injections_for_resolved_providers = function(){
  return _.flatten(_.map(Ioc.getResolvedProviders(),function(value,key){
    return value.injections
  }))
}

/**
 * @function get_all_resolved_providers
 * @description It returns namespaces for all resolved providers so far.
 * @return {Array}
 */
RegisterarHelpers.get_all_resolved_providers = function(){
  return _.keys(Ioc.getResolvedProviders())
}

/**
 * @function get_all_unresolved_providers
 * @description It returns namespaces for all unresolved providers.
 * @return {Array}
 */
RegisterarHelpers.get_all_unresolved_providers = function(){
  return _.keys(Ioc.getUnResolvedProviders())
}
