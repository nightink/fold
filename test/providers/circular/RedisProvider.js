'use strict'

const Ioc = require('../../../src/Ioc')


class Redis{
  constructor(){
    this.client = 'hredis'
  }
}

class RedisProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('Core/Redis',function(){
        return new Redis()
      })
      resolve()
    })
  }

}

module.exports = RedisProvider
