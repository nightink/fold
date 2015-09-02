'use strict'

const _ = require('lodash')
const ImplementationException = require('../Exception/implementation')
const co = require('co')
const introspect = require('../../utils/introspect')

let staticInjections = []

/**
 * @module IocHelpers
 * @description Helpers for Ioc container
 * @private
 */
let IocHelpers = exports = module.exports = {}

/**
 * @function is_verified_as_binding
 * @description here we verify a provider is using correct
 * interface to be registered.
 * @param  {String} binding
 * @param  {Object} bindingModule
 * @return {Boolean}
 */
IocHelpers.is_verified_as_binding = function (binding, bindingModule) {
  if (!bindingModule.closure || typeof (bindingModule.closure) !== 'function') {
    throw new ImplementationException(`Invalid Service provider implementation . ${binding} should return a closure`)
  } else {
    return true
  }
}

/**
 * @function inject_type_hinted_injections
 * @description return bindings required by a service provider
 * @param  {Object} bindings
 * @param  {Object} bindingModule
 * @return {Array}
 */
IocHelpers.inject_type_hinted_injections = function (bindings, bindingModule) {
  return _.pick(bindings, bindingModule.injections)
}

/**
 * @function register_provider
 * @description Here we register and resolve a provider to
 * the ioc container.
 * @param  {Class} provider
 * @return {Promise<fulfilled>}
 */
IocHelpers.register_provider = function (Provider) {
  return new Promise(function (resolve, reject) {
    if(Provider.inject){
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
 * @function bind_provider
 * @description constructors provider defination as an object
 * @param  {Object} resolved_providers
 * @param  {Object} unresolved_providers
 * @param  {String} binding
 * @param  {Function} closure
 * @param  {Boolean} singleton
 * @return {Object}
 */
IocHelpers.bind_provider = function(resolved_providers,unresolved_providers,binding,closure,singleton){
  // removing from unresolved if it was
  // deferred.
  if (unresolved_providers[binding]) {
    delete unresolved_providers[binding]
  }

  // here we throw an error if service provider bind implementation
  // does not returns a closure.
  IocHelpers.is_verified_as_binding(binding, {closure})

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
  resolved_providers[binding] = {closure, injections, singleton}
}
