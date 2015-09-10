'use strict'

/**
 * adonis-fold
 * Copyright(c) - Harminder Virk
 * MIT Licensed
*/

class ImplementationException extends Error {
  constructor (message) {
    super()
    this.name = 'IMPLEMENTATION_ERROR'
    this.message = message
  }
}

module.exports = ImplementationException
