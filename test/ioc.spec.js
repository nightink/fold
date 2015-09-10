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
const IocHelpers = require('../src/Ioc/helpers')
const ImplementationException = require('../src/Exception/implementation')
const MakeException = require('../src/Exception/make')
const chai = require('chai')
const path = require('path')
const expect = chai.expect

describe('Ioc', function () {
  beforeEach(function () {
    console.time('test')
  })

  afterEach(function () {
    Ioc.clear()
    console.timeEnd('test')
  })

  it('should return an error when service provider implementation is not correct', function (done) {
    const fn = function () {
      return Ioc.bind('App/Foo', 'Foo')
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

  it('should add providers to the list of deferred providers , when they have been registed via later method', function () {
    const providerPath = path.join(__dirname, './providers/AppProvider.js')
    Ioc.later('App/Deferred', providerPath)
    expect(Ioc.getUnResolvedProviders()['App/Deferred']).to.equal(providerPath)
  })

  it('should throw ImplementationException when trying to use unresolved provider', function () {
    const providerPath = path.join(__dirname, './providers/AppProvider.js')
    Ioc.later('App/Deferred', providerPath)
    const fn = function () {
      return Ioc.use('App/Deferred')
    }
    expect(fn).to.throw(ImplementationException)
  })

  it('should inspect provider Closure to build dependency tree', function () {
    class Baz {
    }
    Ioc.bind('App/Baz', function (App_Foo) {
      return new Baz()
    })
    const bazObject = Ioc.getResolvedProviders()['App/Baz']
    expect(bazObject.injections).to.deep.equal(['App/Foo'])

  })

  it('should make use of static inject property over class constructor while making classes', function (done) {
    class Foo {
      constructor () {
        this.foo = 'boom'
      }
    }

    Ioc.bind('App/Foo', function () {
      return new Foo()
    })

    class Baz {
      static get inject () {
        return ['App/Foo']
      }
      constructor (Foo) {
        this.foo = Foo.foo
      }
    }

    Ioc
      .make(Baz)
      .then(function (instance) {
        expect(instance.foo).to.equal('boom')
        done()
      }).catch(done)

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
    expect(fn).to.throw(Error)
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
      constructor () {
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
      constructor () {
        this.name = 'redis'
      }
    }

    class User {
      constructor (App_Redis) {
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
      constructor (App_Database) {
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
      constructor (Core_Cache) {
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

  it('should throw an error when trying to make unregistered binding', function (done) {
    Ioc.make('Foo')
      .catch(function (error) {
        expect(error).to.be.an.instanceof(Error)
        done()
      })
  })

  it('should throw an error when trying to make a variable which is not a valid class', function (done) {
    var Foo = {}
    Ioc.make(Foo)
      .catch(function (error) {
        expect(error).to.be.an.instanceof(MakeException)
        done()
      })
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

  it('should bind providers as singleton and return the same instance every time', function (done) {
    class Timer {
      constructor () {
        this.currentTime = new Date()
      }
    }

    Ioc.singleton('Timer', function () {
      return new Timer()
    })

    const timer1 = Ioc.use('Timer')
    setTimeout(function () {
      const timer2 = Ioc.use('Timer')
      expect(timer2.currentTime).to.equal(timer1.currentTime)
      done()
    }, 1000)

  })

  it('should make use of static injections over provider callback typehiniting', function (done) {
    class Foo {
      constructor (bar) {
        this.greet = bar.greet
      }
    }

    class Bar {
      constructor () {
        this.greet = 'hello'
      }
    }

    Ioc.bind('App/Bar', function () {
      return new Bar()
    })

    class FooProvider {

      static get inject () {
        return ['App/Bar']
      }

      * register () {
        Ioc.bind('App/Foo', function (bar) {
          return new Foo(bar)
        })
      }
    }

    IocHelpers
      .registerProvider(FooProvider)
      .then(function () {
        const FooInstance = Ioc.use('App/Foo')
        expect(FooInstance.greet).to.equal('hello')
        done()
      }).catch(done)

  })

  describe('Ioc Helpers', function () {
    it('should register a provider with class defination even if there is no register method', function (done) {
      class FooProvider {
      }
      IocHelpers
        .registerProvider(FooProvider)
        .then(done).catch(done)
    })
  })

})
