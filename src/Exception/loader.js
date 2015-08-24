'use strict'

class LoaderException extends Error {

  constructor( message) {
    super()
    this.name = 'MISSING_DEPENDENCY'
    this.message = message
  }

}

module.exports = LoaderException
