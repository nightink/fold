'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Ioc = require('../Ioc')
function ServiceProvider () {
  this.app = Ioc
}

module.exports = ServiceProvider
