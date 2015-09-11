'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

class MakeException extends Error {

  constructor (message) {
    super()
    this.name = 'MAKE_EXCEPTION'
    this.message = message
  }
}

module.exports = MakeException
