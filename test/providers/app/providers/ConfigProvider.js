'use strict'

const Ioc = require('../../../../src/Ioc')

class Config{

  constructor(){
    this.client = 'mysql'
  }
}

class ConfigProvider {
  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Config',function(){
        return new Config()
      })
      resolve()
    })
  }

}

module.exports = ConfigProvider
