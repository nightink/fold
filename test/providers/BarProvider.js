'use strict'

const Ioc = require('../../src/Ioc')

class Bar{
  constructor(Bar){
    this.bar = 'barbar'
  }
}

class BarProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      setTimeout(function(){
        self.app.bind('App/Bar',function(){
          return new Bar()
        })
        resolve()
      })
    });
  }
}

module.exports = BarProvider
