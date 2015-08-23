'use strict'

const Ioc = require('../../src/Ioc')

class Boom{
  constructor(){
    this.foo = 'bar'
  }
}

class AppProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Boom',function(){
        return new Boom()
      })
      resolve()
    });
  }
}

module.exports = AppProvider
