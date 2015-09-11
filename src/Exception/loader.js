'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

class LoaderException extends Error {

  constructor (message) {
    super()
    this.name = 'MISSING_DEPENDENCY'
    this.message = message
  }

}

module.exports = LoaderException
