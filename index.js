'use strict'

const Ioc = require('./src/Ioc')
const Registerar = require('./src/Registerar')
const ServiceProvider = require('./src/ServiceProvider')

GLOBAL.use = Ioc.use
GLOBAL.make = Ioc.make

module.exports = {
  Registerar: Registerar,
  Ioc: Ioc,
  ServiceProvider: ServiceProvider
}
