'use strict'

/**
 * @module MakeException
 * @description makes a new exception there is an error
 * while making classes.
 */
class MakeException extends Error {

  constructor (message) {
    super()
    this.name = 'MAKE_EXCEPTION'
    this.message = message
  }
}

module.exports = MakeException
