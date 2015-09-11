'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const _ = require('lodash')
const ImplementationException = require('../Exception/implementation')
const co = require('co')
const introspect = require('../../utils/introspect')

/**
 * holding injections asked by a provider class
 * using static inject getter.
 * @type {Array}
 * @private
 */
let staticInjections = []

/**
 * @module IocHelpers
 * @description Helpers for Ioc container
 */
let IocHelpers = exports = module.exports = {}

/**
 * @function isVerifiedAsBinding
 * @description here we verify a provider is using correct
 * interface to be registered.
 * @param  {String} binding
 * @param  {Object} bindingModule
 * @return {Boolean}
 * @public
 */
IocHelpers.isVerifiedAsBinding = function (binding, bindingModule) {
  if (!bindingModule.closure || typeof (bindingModule.closure) !== 'function') {
    throw new ImplementationException(`Invalid Service provider implementation . ${binding} should return a closure`)
  } else {
    return true
  }
}

/**
 * @function injectTypeHintedInjections
 * @description return bindings required by a service provider
 * @param  {Object} bindings
 * @param  {Object} bindingModule
 * @return {Array}
 * @public
 */
IocHelpers.injectTypeHintedInjections = function (bindings, bindingModule) {

  const picked = _.pick(bindings, bindingModule.injections)

  const unableToPick = _.difference(bindingModule.injections,_.keys(picked))

  /**
   * returning error when required dependencies are not met
   * by resolved dependencies
   */
  if(_.size(unableToPick) > 0){
    throw new Error(`Unable to inject ${unableToPick.join(' and ')}`)
  }

  return picked
}

/**
 * @function registerProvider
 * @description Here we register and resolve a provider to
 * the ioc container.
 * @param  {Class} provider
 * @return {Promise<fulfilled>}
 * @public
 */
IocHelpers.registerProvider = function (Provider) {
  return new Promise(function (resolve, reject) {
    if (Provider.inject) {
      staticInjections = Provider.inject
    }

    let instance = new Provider()
    if (!instance.register || typeof (instance.register) !== 'function') {
      return resolve()
    }
    co(function *() {
      yield instance.register()
    }).then(resolve).catch(reject)
  })
}

/**
 * @function bindProvider
 * @description constructors provider defination as an object
 * @param  {Object} resolvedProviders
 * @param  {Object} unResolvedProviders
 * @param  {String} binding
 * @param  {Function} closure
 * @param  {Boolean} singleton
 * @return {Object}
 * @public
 */
IocHelpers.bindProvider = function (resolvedProviders, unResolvedProviders, binding, closure, singleton) {
  // removing from unresolved if it was
  // deferred.
  if (unResolvedProviders[binding]) {
    delete unResolvedProviders[binding]
  }

  // here we throw an error if service provider bind implementation
  // does not returns a closure.
  IocHelpers.isVerifiedAsBinding(binding, {closure})

  // introspecting injections or use static injections , if there
  let injections = staticInjections.length ? staticInjections : introspect.inspect(closure)

  // converting underscored dependencies to
  // namespces
  injections = _.map(injections, function (injection) {
    return injection.replace(/_/g, '/')
  })

  // clear staticInjections once have injections in place
  staticInjections = []

  // adding to resolved providers
  resolvedProviders[binding] = {closure, injections, singleton}
}
