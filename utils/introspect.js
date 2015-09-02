'use strict'

const argumentsRegExp = /(constructor|function)\w*\s*\(([\s\S]*?)\)/;
const replaceRegExp = /[ ,\n\r\t]+/;

/**
 * @module Introspect
 * @description Reads parameters inside constructor function on
 * es6 class or plain functions
 */
let Introspect = exports = module.exports = {}

/**
 * @function inspect
 * @description Inspect function constructor and
 * returns dependencies from arguments
 * @param  {Function} fn
 * @return {Array}
 */
Introspect.inspect = function(fn){
  var fnArguments = argumentsRegExp.exec(fn)
  if(!fnArguments || !fnArguments[2]){
    return []
  }
  fnArguments = fnArguments[2].trim();
  if (0 === fnArguments.length) return [];
  return fnArguments.split(replaceRegExp);
}
