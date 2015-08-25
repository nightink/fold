'use strict'

/*
|--------------------------------------------------------------------------
|   Testing Loader Expectations.
|--------------------------------------------------------------------------
|
|   Here we test expectations from module loader and make sure
|   everything works as expected.
|
*/

const Loader = require('../src/Loader')
const LoaderException = require('../src/Exception/loader')
const chai = require('chai')
const path = require('path')
const should = chai.should()
const expect = chai.expect

describe('Module Loader', function () {

  beforeEach(function(){
    console.time("test");
  })

  afterEach(function () {
    console.timeEnd("test");
  })


  describe('Use', function () {
    it('should throw an LoaderException error when unable to require module', function () {
      const fn = function () {
        return Loader.require('somemodule')
      }
      expect(fn).to.throw(LoaderException)
    })

    it('should load module using node require method', function () {
      const lodash = Loader.require('lodash')
      expect(lodash).to.be.a('function')
      expect(lodash.each).to.be.a('function')
    })

    it('should return an error when unable to find module inside containers bindings', function () {
      const fn = function () {
        return Loader.resolve({}, 'App/Db')
      }
      expect(fn).to.throw(LoaderException)
    })

    it('should return injected binding Closure from Ioc container', function () {
      const binding = function () { return 'foo' }
      const bindings = {'App/Foo': binding}
      const Foo = Loader.resolve(bindings, 'App/Foo')
      expect(Foo()).to.equal('foo')
    })

    it('should determine type of injection to be fulfilled and fallback to npm module when not find inside container', function () {
      const module = Loader.return_injection_type({}, {}, {}, {}, 'lodash')
      expect(module).to.equal('NPM_MODULE')
    })

    it('should determine type of injection and get internal mapping if exists inside dump', function () {
      const module = Loader.return_injection_type({}, {}, {}, {'App/Users': '../../user'}, 'App/Users')
      expect(module).to.equal('LOCAL_MODULE')
    })

    it("should determine ioc bindings for a service provider if injection is available inside container's bindings", function () {
      const binding = function () { return 'foo' }
      const module = Loader.return_injection_type({'App/Users': binding}, {}, {}, {}, 'App/Users')
      expect(module).to.equal('PROVIDER')
    })

    it("should resolve binding based upon it's type", function () {
      const binding = function () { return 'foo' }
      const bindings = {'App/Foo': binding}

      const type = Loader.return_injection_type(bindings, {}, {}, {}, 'App/Foo')
      const instance = Loader.resolve_using_type(bindings, {}, {}, {}, 'App/Foo', type)

      expect(type).to.equal('PROVIDER')
      expect(instance()).to.equal('foo')
    })
  })

  describe('Load', function () {
    it('should load all files containing functions and classes recursively inside a directory and generate thier namespaces with paths', function (done) {
      const basePath = path.join(__dirname, '/app')
      const baseNameSpace = 'App'

      Loader.generate_directory_hash(basePath, basePath, baseNameSpace)
      .then(function(hash){
        expect(hash).to.be.an('object')
        expect(hash['App/Services/UserService']).to.equal(path.join(__dirname + '/app/Services/UserService.js'))
        done()
      }).catch(done)
    })

    it('should save generated hash inside a file as a node module', function(done){

      const basePath = path.join(__dirname, '/app')
      const baseNameSpace = 'App'


      Loader.generate_directory_hash(basePath, basePath, baseNameSpace)
      .then(function(hash){
        expect(hash).to.be.an('object')
        expect(hash['App/Services/UserService']).to.equal(path.join(__dirname + '/app/Services/UserService.js'))
        return Loader.save_directory_dump(hash)
      })
      .then(function(){
        let hash = require('../dump/hash.js')
        expect(hash).to.be.an('object')
        expect(hash['App/Services/UserService']).to.equal(path.join(__dirname + '/app/Services/UserService.js'))
        done()
      })
      .catch(done)
    });

  })
})
