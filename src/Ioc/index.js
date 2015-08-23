'use strict'

const Loader = require('../Loader/index')
const introspect = require('introspect')
const MakeException = require('../Exception.make')
const helpers = require('./helpers')
const _ = require('lodash')

let resolved_providers = {}
let unresolved_providers = {}
let aliases = {}
let dump = {}

let Ioc = exports = module.exports = {};

Ioc.bind = function(binding,closure){
  let injections = introspect(closure)
  injections = _.map(injections,function(injection){
    return injection.replace(/_/g,'/')
  })
  resolved_providers[binding] = {closure,injections}
}

Ioc.clear = function(){
  resolved_providers = {}
  unresolved_providers = {}
  dump = {}
}

Ioc.getResolvedProviders = function(){
  return resolved_providers
}

Ioc.getUnResolvedProviders = function(){
  return unresolved_providers
}

Ioc.aliases = function(hash){
  _.each(hash,function(value,key){
    Ioc.alias(key,value)
  })
}

Ioc.alias = function(key,namespace){
  aliases[key] = namespace
}

Ioc.later = function(provides,klass){
  unresolved_providers[provides] = klass
}

Ioc.use = function(binding){
  const type = Loader.return_injection_type(resolved_providers,aliases,dump,binding)
  const bindingModule = Loader.resolve_using_type(resolved_providers,aliases,dump,binding,type)

  if(type === 'PROVIDER' && helpers.is_verified_as_binding(binding,bindingModule)){
    let injections = helpers.inject_type_hinted_injections(resolved_providers,bindingModule)
    injections = _.map(injections,function(injection,index){
      return Ioc.use(index)
    })
    return bindingModule.closure.apply(null,injections)
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
Ioc.make = function(binding){

  return new Promise(function(resolve,reject){
    if(typeof(binding) !== 'string' && typeof(binding.constructor) !== 'function'){
      reject(new MakeException(`unable to make ${binding} ,looking for a class defination or ioc container namespace`))
    }

    if(typeof(binding) === 'string'){
      const type = Loader.return_injection_type(resolved_providers,aliases,dump,binding)
      const bindingModule = Loader.resolve_using_type(resolved_providers,aliases,dump,binding,type)
    }

  })


}
