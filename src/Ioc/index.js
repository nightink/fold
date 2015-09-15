'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Loader = require('../Loader/index')
const introspect = require('../../utils/introspect')
const MakeException = require('../Exception/make')
const ImplementationException = require('../Exception/implementation')
const helpers = require('./helpers')
const _ = require('lodash')
const Q = require('q')

/*
|--------------------------------------------------------------------------
|   Holding Injections
|--------------------------------------------------------------------------
|
|   Ioc has to maintain reference to all injections and recognize them
|   as different identities. Below stores maintain reference to
|   each logical identity
|
|   1. resolveProviders - Providers which have been registered and
|      resolved on boot cycle.
|   2. unResolveProviders - Providers which are deferred and only
|      registered on boot cycle and will be resolved on demand.
|   3. dump - Dump is a map of autoload directory and will be
|     returned as require(module)
|   4. Aliases - Aliases are short names for service providers
|      namespaces.
|
*/

/**
 * reference to resolved providers
 * @type {Object}
 * @private
 */
let resolveProviders = {}

/**
 * reference to deferred providers
 * @type {Object}
 * @private
 */
let unResolveProviders = {}

/**
 * namespace aliases
 * @type {Object}
 * @private
 */
let aliases = {}

/**
 * reference to autoload dump
 * @type {Object}
 * @private
 */
let dump = {}

try {
  dump = require('../../dump/hash')
} catch(e) {
  dump = {}
}

/**
 * @module Ioc
 * @description Ioc is responsible for DI around your
 * application and trust me it's fun.
 * @type {Object}
 */
let Ioc = exports = module.exports = {}

/**
 * @function bind
 * @description bind a provider to application
 * @param  {String} binding binding namespace , have to be unique
 * @param  {Function} closure closure to be executed while resolving
 * provider
 * @return {void}
 * @public
 */
Ioc.bind = function (binding, closure) {
  const singleton = false
  helpers.bindProvider(resolveProviders, unResolveProviders, binding, closure, singleton)
}

/**
 * @function bind
 * @description bind a provider to application as singleton
 * @param  {String} binding binding namespace , have to be unique
 * @param  {Function} closure closure to be executed while resolving
 * provider
 * @return {void}
 * @public
 */
Ioc.singleton = function (binding, closure) {
  const singleton = true
  helpers.bindProvider(resolveProviders, unResolveProviders, binding, closure, singleton)
}

/**
 * @function clear
 * @description Clearing all injections
 * @return {void}
 * @public
 */
Ioc.clear = function () {
  resolveProviders = {}
  aliases = {}
  unResolveProviders = {}
  dump = {}
}

/**
 * @function getResolvedProviders
 * @description getting list of resolved providers
 * @return {Object}
 * @public
 */
Ioc.getResolvedProviders = function () {
  return resolveProviders
}

/**
 * @function getUnResolvedProviders
 * @description getting list of un resolved providers
 * @return {Object}
 * @public
 */
Ioc.getUnResolvedProviders = function () {
  return unResolveProviders
}

/**
 * @function aliases
 * @description Adding aliases for providers,
 * they are short names
 * @param  {Object} hash
 * @return {void}
 * @public
 */
Ioc.aliases = function (hash) {
  _.each(hash, function (value, key) {
    Ioc.alias(key, value)
  })
}

/**
 * @function alias
 * @description Adding alias to a single service provider
 * @param  {String} key
 * @param  {String} namespace
 * @return {void}
 * @public
 */
Ioc.alias = function (key, namespace) {
  aliases[key] = namespace
}

/**
 * @function later
 * @description Add provider to the list of deferred providers
 * @param  {String} provides Namespace for injection
 * @param  {String} klass    path to provider
 * @return {void}
 * @public
 */
Ioc.later = function (provides, klass) {
  unResolveProviders[provides] = klass
}

/**
 * @function dump
 * @description Adding key value pair to dump
 * , dump is a map of autloaded directory.
 * @param  {String} key
 * @param  {String} path
 * @return {void}
 * @public
 */
Ioc.dump = function (key, path) {
  dump[key] = path
}

/**
 * @function use
 * @description Equalent to node's require , with
 * more application specific logic.
 * @param  {String} binding
 * @return {*}
 * @public
 */
Ioc.use = function (binding) {
  // here we look for type of binding
  // it can be a PROVIDER, UNRESOLVED_PROVIDER, NPM_MODULE,LOCAL_MODULE
  const type = Loader.returnInjectionType(resolveProviders, unResolveProviders, aliases, dump, binding)

  // if looking for unresolved provider , send them back with an error
  if (type === 'UNRESOLVED_PROVIDER') {
    throw new ImplementationException(`${binding} is a unresolved provider , use \`make\` function to get resolved instance`)
  }

  // here we grab that binding using it's type
  let bindingModule = Loader.resolveUsingType(resolveProviders, unResolveProviders, aliases, dump, binding, type)

  // if i am resolved provider than make me before returning
  if (type === 'PROVIDER' && helpers.isVerifiedAsBinding(binding, bindingModule)) {
    let injections = helpers.injectTypeHintedInjections(resolveProviders, bindingModule)
    injections = _.map(injections, function (injection, index) {
      return Ioc.use(index)
    })
    if (bindingModule.singleton) {
      if (!bindingModule.instance) {
        bindingModule.instance = bindingModule.closure.apply(null, injections)
      }
      return bindingModule.instance
    }
    return bindingModule.closure.apply(null, injections)
  }

  // hooks helps in transforming the return result
  // and return something else.
  // @use case - Lucid class for models
  if(bindingModule.hooks){
    _.each(bindingModule.hooks, function (hook){
      bindingModule = bindingModule[hook]()
    })
  }
  return bindingModule
}

/*
|--------------------------------------------------------------------------
|   Making a class
|--------------------------------------------------------------------------
|
|   This is where all magic happens for any class and this method should
|   follow below rules.
|   RULES:-
|   1. One can inject a class defination and should be able to get resolved
|   instance.
|   2. One can inject a namespace for registered binding and can get instance
|     of it.
|   3. Instance can only be made for classes.
|   4. Injections should be type hinted or can be retreived using static
|     inject method.
|
*/
/**
 * @function make
 * @description here all the magic happens, using make you can resolve any
 * class using it's namespace or even it's defination and get stable
 * instance with all resolved dependencies
 * @param  {*} binding
 * @return {*}
 * @public
 */
Ioc.make = function (binding) {
  return new Promise(function (resolve, reject) {
    let type = null

    // if trying to make a instance of something that is not a class , neither
    // a binding
    if (typeof (binding) !== 'string' && (typeof (binding) !== 'function' || typeof (binding.constructor) !== 'function')) {
      throw new MakeException(`unable to make ${binding} ,looking for a class defination or ioc container namespace`)
    }

    /**
     * A dummy promise to be used when binding is not
     * a un resolved binding otherwise we replace it
     * with registerProvider method
     */
    let registerPromise = new Promise(function (resolve) { resolve() })

    if (typeof (binding) === 'string') {
      type = Loader.returnInjectionType(resolveProviders, unResolveProviders, aliases, dump, binding)
      if (type === 'UNRESOLVED_PROVIDER') {
        let provider = require(unResolveProviders[binding])
        registerPromise = helpers.registerProvider(provider)
      }
    }

    registerPromise
      .then(function (resolvedClass) {
        switch (type) {
          case 'PROVIDER':
            return Ioc._makeProvider(resolveProviders[binding])
          case 'UNRESOLVED_PROVIDER':
            return Ioc._makeProvider(resolveProviders[binding])
          case 'NPM_MODULE':
            return new Promise(function (resolve) { resolve() })
          case 'LOCAL_MODULE':
            return Ioc._makeClass(Ioc.use(binding))
          default:
            return Ioc._makeClass(binding)
        }
      }).then(function (instance) {
      if (type && type !== 'LOCAL_MODULE') {
        return resolve(Ioc.use(binding))
      }
      resolve(instance)
    }).catch(reject)
  })
}

/**
 * @function _makeProvider
 * @private
 * @description here we make a provider and resolve it's dependencies
 * until dependencies are stable
 * @param  {Object} provider
 * @return {Promise<pending>}
 * @public
 */
Ioc._makeProvider = function (provider) {
  let instances = []
  provider.injections.forEach(function (injection) {
    instances.push(Ioc.make(injection))
  })
  return Q.all(instances)
}

/**
 * @function _makeClass
 * @private
 * @description here we an instance of a class and resolve it's
 * dependencies based on constructor injections or static
 * inject getter.
 * @param  {Class} binding
 * @return {Promise<pending>}
 * @public
 */
Ioc._makeClass = function (Binding) {
  let _bind = Function.prototype.bind
  return new Promise(function (resolve, reject) {
    let injections = []
    let instances = []

    /**
     * if class has a inject method use it , otherwise
     * make it by reading constructor
     */
    if (Binding.inject) {
      injections = Binding.inject
    } else {
      injections = introspect.inspect(Binding.toString())
    }

    if (injections && _.size(injections) > 0) {
      injections.forEach(function (injection) {
        injection = injection.replace(/_/g, '/')
        instances.push(Ioc.make(injection))
      })

      Q
      .all(instances)
      .then(function (values) {
        resolve(new (_bind.apply(Binding, [null].concat(values)))())
      }).catch(reject)

    } else {
      resolve(new Binding())
    }

  })
}
