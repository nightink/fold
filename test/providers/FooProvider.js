'use strict'

const Ioc = require('../../src/Ioc')

class Foo{
  constructor(Boom){
    this.foo = Boom.foo
  }
}

class FooProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Foo',function(App_Boom){
        return new Foo(App_Boom)
      })
      resolve()
    });
  }
}

module.exports = FooProvider
