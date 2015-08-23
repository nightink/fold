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

describe("Ioc",function(){

  afterEach(function(){
    Ioc.clear()
  })

  it("should return an error when service provider implementation is not correct",function(done){
    Ioc.bind('App/Foo','Foo')
    const fn = function(){
      return Ioc.use('App/Foo')
    }
    expect(fn).to.throw(ImplementationException)
    done()
  });

  it("should return binding registered via service provider",function(){
    class Foo{
    }
    Ioc.bind('App/Foo',function(){
      return new Foo()
    })
    const foo = Ioc.use("App/Foo")
    expect(foo).to.be.an.instanceof(Foo)
  });

  it("should resolve node modules",function(){
    const _ = Ioc.use("lodash")
    expect(_).to.be.a('function')
    expect(_.each).to.be.a('function')
  });

  it("should not resolve local modules without namespacing",function(){
    const fn = function(){
      return Ioc.use("./app/Services/UserService")
    }
    expect(fn).to.throw(LoaderException)
  });

  it("should resolve providers using aliases",function(){
    class Alias{}
    Ioc.bind('App/Alias',function(){
      return new Alias()
    })
    Ioc.aliases({"ALI":"App/Alias"})
    expect(Ioc.use("ALI")).to.be.an.instanceof(Alias)
  });

});
