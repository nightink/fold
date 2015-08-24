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

  promisify(){
    return new Promise(function(resolve,reject){
      setTimeout(function(){
        resolve()
      },300)
    })
  }

  *register(){
    yield this.promisify()
    this.app.bind('App/Generator',function(){
      return new Generator()
    })
  }
}

module.exports = GeneratorProvider
