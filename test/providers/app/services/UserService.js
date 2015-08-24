'use strict'

class UserService{

  constructor(App_Database){
    this.db = App_Database
  }

  greet(){
    return `Hello from UserService using ${this.db.client} as db client`
  }

}

module.exports = UserService
