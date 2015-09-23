'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

class LoaderException extends Error {

  constructor (message) {
    super(message)

    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: this.constructor.name
    })

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor)
    } 
    else {
      Object.defineProperty(this, 'stack', {
        enumerable: false,
        value: (new Error(message)).stack
      })
    }
  }
}

module.exports = LoaderException
