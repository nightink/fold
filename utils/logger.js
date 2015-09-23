'use strict'

/**
 * adonis-fold
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const winston = require('winston')

/**
 * setting up logger instance
 */
let logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: false,
      prefixes: 'adonis',
      prettyPrint: true,
      colorize: true
    })
  ]
})

/**
 * if --verbose flag have been passed while running script
 * than set level of logger to verbose
 */
if (process.argv.indexOf('--verbose') > -1) {
  logger.level = 'verbose'
}

/**
 * if --silly flag have been passed while running script
 * than set level of logger to silly
 */
if (process.argv.indexOf('--silly') > -1) {
  logger.level = 'silly'
}

exports = module.exports = logger
