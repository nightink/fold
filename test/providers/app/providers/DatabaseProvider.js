'use strict'

const Ioc = require('../../../../src/Ioc')

class Database{

  constructor(Config){
    this.client = Config.client
  }
}

class DatabaseProvider {
  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Database',function(App_Config){
        return new Database(App_Config)
      })
      resolve()
    })
  }

}

module.exports = DatabaseProvider
