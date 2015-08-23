'use strict'

class MakeException extends Error{

  constructor(message){
    super()
    this.name = 'MAKE_EXCEPTION'
    this.message = message
  }
}

module.exports =  MakeException
