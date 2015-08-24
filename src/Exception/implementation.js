'use strict'

/**
 * @module ImplementationException
 * @description makes a new implementation error
 */
class ImplementationException extends Error {
  constructor (message) {
    super()
    this.name = 'IMPLEMENTATION_ERROR'
    this.message = message
  }
}

module.exports = ImplementationException
