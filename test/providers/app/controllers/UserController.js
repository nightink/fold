'use strict'

class UserController{

  constructor(UserService){

    this.service = UserService

  }

  greet(){
    return this.service.greet()
  }

}

module.exports = UserController
