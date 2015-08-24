'use strict'

const Ioc = require('../../../src/Ioc')


class Cache{
  constructor(Redis){
    this.client = Redis.client
  }
}

class CacheProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('Core/Cache',function(Core_Redis){
        return new Cache(Core_Redis)
      })
      resolve()
    })
  }

}

module.exports = CacheProvider
