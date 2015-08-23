'use strict'

const _ = require('lodash')
const ImplementationException = require('../Exception/implementation')

let IocHelpers = exports = module.exports = {}

IocHelpers.is_verified_as_binding = function(binding,bindingModule){
  if(!bindingModule.closure || typeof(bindingModule.closure) !== 'function'){
    throw new ImplementationException(`Invalid Service provider implementation . ${binding} should return a closure`)
  }else{
    return true
  }
}

IocHelpers.inject_type_hinted_injections = function(bindings,bindingModule){
  return _.pick(bindings,bindingModule.injections)
}
