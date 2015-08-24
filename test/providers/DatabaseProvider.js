'use strict'

const Ioc = require('../../src/Ioc')


class Database{
  constructor(){
    this.client = 'mysql'
  }
}

class DatabaseProvider{

  constructor(){
    this.app = Ioc
  }

  register(){
    let self = this
    return new Promise(function(resolve){
      self.app.bind('App/Database',function(){
        return new Database()
      })
      resolve()
    })
  }

}

module.exports = DatabaseProvider
