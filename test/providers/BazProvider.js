'use strict'

const Ioc = require('../../src/Ioc')

class Baz{
  constructor(Bar){
    this.bar = Bar.bar
  }
}

class BazProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Baz',function(App_Bar){
        return new Baz(App_Bar)
      })
      resolve()
    });
  }
}

module.exports = BazProvider
