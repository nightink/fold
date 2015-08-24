'use strict'

const Ioc = require('./src/Ioc')
const Registerar = require('./src/Registerar')

GLOBAL.use = Ioc.use
GLOBAL.make = Ioc.make

module.exports = {
  Registerar: Registerar,
  Ioc: Ioc
}
