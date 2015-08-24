'use strict'

/**
 * @module LoaderException
 * @description makes a new exception if
 * dependency is missing.
 */
class LoaderException extends Error {

  constructor (message) {
    super()
    this.name = 'MISSING_DEPENDENCY'
    this.message = message
  }

}

module.exports = LoaderException
