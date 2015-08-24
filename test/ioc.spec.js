'use strict'

/*
|--------------------------------------------------------------------------
|   Testing Ioc Container Expectations.
|--------------------------------------------------------------------------
|
|   Here we test expectations from ioc container and make sure
|   everything works as expected.
|
*/

const Ioc = require('../src/Ioc')
const ImplementationException = require('../src/Exception/implementation')
const LoaderException = require('../src/Exception/loader')
const chai = require('chai')
const path = require('path')
const should = chai.should()
const expect = chai.expect

describe('Ioc', function () {
  afterEach(function () {
    Ioc.clear()
  })

  it('should return an error when service provider implementation is not correct', function (done) {
    Ioc.bind('App/Foo', 'Foo')
    const fn = function () {
      return Ioc.use('App/Foo')
    }
    expect(fn).to.throw(ImplementationException)
    done()
  })

  it('should return binding registered via service provider', function () {
    class Foo {
    }
    Ioc.bind('App/Foo', function () {
      return new Foo()
    })
    const foo = Ioc.use('App/Foo')
    expect(foo).to.be.an.instanceof(Foo)
  })

  it('should resolve node modules', function () {
    const _ = Ioc.use('lodash')
    expect(_).to.be.a('function')
    expect(_.each).to.be.a('function')
  })

  it('should not resolve local modules without namespacing', function () {
    const fn = function () {
      return Ioc.use('./app/Services/UserService')
    }
    expect(fn).to.throw(LoaderException)
  })

  it('should resolve providers using aliases', function () {
    class Alias {
    }
    Ioc.bind('App/Alias', function () {
      return new Alias()
    })
    Ioc.aliases({'ALI': 'App/Alias'})
    expect(Ioc.use('ALI')).to.be.an.instanceof(Alias)
  })

  it('should make a class with class defination and zero injections', function (done) {
    class User {
      constructor() {
        this.name = 'foo'
      }
    }

    Ioc.make(User)
      .then(function (instance) {
        expect(instance).to.be.an.instanceof(User)
        expect(instance.name).to.equal('foo')
        done()
      }).catch(done)

  })

  it('should make a class with class defination , which has dependencies on service providers', function (done) {
    class Redis {
      constructor() {
        this.name = 'redis'
      }
    }

    class User {
      constructor( App_Redis) {
        this.name = App_Redis.name
      }
    }

    Ioc.bind('App/Redis', function () {
      return new Redis()
    })

    Ioc.make(User)
      .then(function (instance) {
        expect(instance).to.be.an.instanceof(User)
        expect(instance.name).to.equal('redis')
        done()
      }).catch(done)

  })

  it('should make a class with class defination , which has dependencies on deferred service providers', function (done) {
    class User {
      constructor( App_Database) {
        this.client = App_Database.client
      }
    }

    Ioc.later('App/Database', path.join(__dirname, './providers/DatabaseProvider'))
    Ioc.make(User)
      .then(function (instance) {
        expect(instance).to.be.an.instanceof(User)
        expect(instance.client).to.equal('mysql')
        done()
      }).catch(done)
  })

  it('should make a class with class defination , which has dependencies on circular deferred service providers', function (done) {
    Ioc.later('Core/Redis', path.join(__dirname, './providers/circular/RedisProvider'))
    Ioc.later('Core/Cache', path.join(__dirname, './providers/circular/CacheProvider'))

    class User {
      constructor( Core_Cache) {
        this.client = Core_Cache.client
      }
    }

    Ioc.make(User)
      .then(function (instance) {
        expect(instance).to.be.an.instanceof(User)
        expect(instance.client).to.equal('hredis')
        done()
      }).catch(done)
  })

  it('should make a class with class defination , which has dependency on another class , and another class has circular dependencies on deferred and resolved providers', function (done) {
    Ioc.later('App/Database', path.join(__dirname, './providers/app/providers/DatabaseProvider'))
    Ioc.later('App/Config', path.join(__dirname, './providers/app/providers/ConfigProvider'))

    Ioc.dump('UserService', path.join(__dirname, './providers/app/services/UserService'))
    Ioc.dump('UserController', path.join(__dirname, './providers/app/controllers/UserController'))

    Ioc.make('UserController')
      .then(function (instance) {
        done()
      }).catch(done)

  })

})
