'use strict'

const Ioc = require('../../src/Ioc')

class Generator{
  constructor(){
    this.foo = 'foo'
  }
}

class GeneratorProvider{

  constructor(){
    this.app = Ioc
  }

  *register(){
    this.app.bind('App/Generator',function(){
      return new Generator()
    })
  }
}

module.exports = GeneratorProvider
