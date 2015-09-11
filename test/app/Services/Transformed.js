'use strict'

class Transformed {
  static get hooks(){
    return ['extend']
  }
  static extend(){
    return 'foo'
  }
}

module.exports = Transformed
