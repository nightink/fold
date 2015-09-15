'use strict'

const Ioc = require('../../src/Ioc')

class Static{
  constructor(Foo){
    this.foo = Foo
  }
}

class Fav{
  constructor(Foo){
    this.foo = Foo
  }
}


class StaticGenerator{

  constructor(){
    this.app = Ioc
  }

  static get inject(){
    return ["App/Foo"]
  }

  *register(){

    this.app.bind('App/Static',function(Foo){
      return new Static(Foo)
    })

    this.app.bind('App/Fav',function(Foo){
      return new Fav(Foo)
    })

  }
}

module.exports = StaticGenerator
