'use strict'

/*
|--------------------------------------------------------------------------
|   Testing Service Provider Registerar Expectations
|--------------------------------------------------------------------------
|
|   Here we test expectations of Registerar to make sure
|   everything works as expected.
|
*/

const Registerar = require('../src/Registerar')
const Ioc = require('../src/Ioc')
const chai = require('chai')
const path = require('path')
const should = chai.should()
const expect = chai.expect

describe('Registerar', function () {

  beforeEach(function(){
    console.time("test");
  })

  afterEach(function () {
    Ioc.clear()
    console.timeEnd("test");
  })

  it('should inject required service providers inside the ioc container', function (done) {
    let providers = [path.join(__dirname, './providers/AppProvider')]
    Registerar
      .register(providers, [])
      .then(function (cycle) {
        let Boom = Ioc.use('App/Boom')
        expect(Boom.foo).to.equal('bar')
        done()
      }).catch(done)
  })

  it('should type hint service providers and inject required dependencies', function (done) {
    let providers = [path.join(__dirname, './providers/AppProvider'), path.join(__dirname, './providers/FooProvider')]
    Registerar
      .register(providers, [])
      .then(function (cycle) {
        let Foo = Ioc.use('App/Foo')
        expect(Foo.foo).to.equal('bar')
        done()
      }).catch(done)
  })

  it('should be able to register deferred providers and resolve them when they required by an existing service provider', function (done) {
    let providers = [path.join(__dirname, './providers/BazProvider')]
    let deferredProviders = {
      'App/Bar': path.join(__dirname, './providers/BarProvider')
    }
    Registerar.register(providers, deferredProviders)
      .then(function () {
        const Baz = Ioc.use('App/Baz')
        expect(Baz.bar).to.equal('barbar')
        done()
      }).catch(done)
  })

  it('should not initiate deferred bindings once done and delete same from unresolvedProviders', function (done) {
    let providers = [path.join(__dirname, './providers/BazProvider')]
    let deferredProviders = {
      'App/Bar': path.join(__dirname, './providers/BarProvider')
    }
    Registerar.register(providers, deferredProviders)
      .then(function () {
        const Bar = Ioc.use('App/Bar')
        expect(Bar.bar).to.equal('barbar')
        expect(Ioc.getUnResolvedProviders()['App/Bar']).to.equal(undefined)
        done()
      }).catch(done)

  })

  it('should work fine when register method on service provider is a generator',function(done){
    let providers = [path.join(__dirname, './providers/GeneratorProvider')]
    Registerar.register(providers,{})
    .then(function(){
      const Generator = Ioc.use("App/Generator")
      expect(Generator.foo).to.equal('foo')
      done()
    }).catch(done)
  })

})
