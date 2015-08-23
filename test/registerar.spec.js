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

describe('Registerar',function(){

  afterEach(function(){
    Ioc.clear()
  })

  it('should inject required service providers inside the ioc container',function(done){

    let providers = [path.join(__dirname,'./providers/AppProvider')]
    Registerar
    .register(providers,[])
    .then(function(cycle){
      let Boom = Ioc.use("App/Boom")
      expect(Boom.foo).to.equal('bar')
      done()
    }).catch(done)
  })

  it('should type hint service providers and inject required dependencies',function(done){
    let providers = [path.join(__dirname,'./providers/AppProvider'),path.join(__dirname,'./providers/FooProvider')]
    Registerar
    .register(providers,[])
    .then(function(cycle){
      let Foo = Ioc.use("App/Foo")
      expect(Foo.foo).to.equal('bar')
      done()
    }).catch(done)
  })

  it('should be able to register deferred providers and resolve them when they required by an existing service provider',function(done){

    let providers = [path.join(__dirname,'./providers/BazProvider')]
    let deferredProviders = {
      'App/Bar': path.join(__dirname,'./providers/BarProvider')
    }
    Registerar.register(providers,deferredProviders)
    .then(function(){
      const Baz = Ioc.use("App/Baz")
      expect(Baz.bar).to.equal('barbar')
      done()
    }).catch(done)
  })

})
