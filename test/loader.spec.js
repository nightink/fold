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
const expect = chai.expect

describe('Module Loader', function () {
  beforeEach(function () {
    console.time('test')
  })

  afterEach(function () {
    console.timeEnd('test')
  })

  describe('Use', function () {
    it('should throw an error when unable to require module', function () {
      const fn = function () {
        return Loader.require('somemodule')
      }
      expect(fn).to.throw(Error)
    })

    it('should throw syntax error properly', function () {
      const fn = function () {
        return Loader.require(path.join(__dirname,'./app/syntaxError'))
      }
      expect(fn).to.throw(/syntaxError\.js:3/)
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
      const module = Loader.returnInjectionType({}, {}, {}, {}, null, null, 'lodash')
      expect(module).to.equal('NPM_MODULE')
    })

    it('should determine type of injection and get internal mapping if exists inside dump', function () {
      const module = Loader.returnInjectionType({}, {}, {}, {'App/Users': '../../user'}, null, null, 'App/Users')
      expect(module).to.equal('LOCAL_MODULE')
    })

    it("should determine ioc bindings for a service provider if injection is available inside container's bindings", function () {
      const binding = function () { return 'foo' }
      const module = Loader.returnInjectionType({'App/Users': binding}, {}, {}, {}, null, null, 'App/Users')
      expect(module).to.equal('PROVIDER')
    })

    it("should resolve binding based upon it's type", function () {
      const binding = function () { return 'foo' }
      const bindings = {'App/Foo': binding}

      const type = Loader.returnInjectionType(bindings, {}, {}, {}, null, null, 'App/Foo')
      const instance = Loader.resolveUsingType(bindings, {}, {}, {}, null, null, 'App/Foo', type)

      expect(type).to.equal('PROVIDER')
      expect(instance()).to.equal('foo')
    })

    it('should return local module as type for bindings starting with namespace', function (){

      const type = Loader.returnInjectionType({}, {}, {}, {}, './app', 'App', 'App/Foo')
      expect(type).to.equal('LOCAL_MODULE')

    })

    it('should require local module when passed namespace', function (){

      const type = Loader.returnInjectionType({}, {}, {}, {}, './app', 'App', 'App/Foo')
      const instance = Loader.resolveUsingType({}, {}, {}, {}, path.join(__dirname,'./app'), 'App', 'App/Http/Users',type)
      expect(type).to.equal('LOCAL_MODULE')
      expect(instance.name).to.equal('Users')

    })


    it('should detect unresolved bindings', function () {
      const binding = function () { return 'foo' }
      const bindings = {'App/Foo': binding}

      const type = Loader.returnInjectionType({}, bindings, {}, {}, null, null, 'App/Foo')
      const instance = Loader.resolveUsingType({}, bindings, {}, {}, null, null, 'App/Foo', type)

      expect(type).to.equal('UNRESOLVED_PROVIDER')
      expect(instance()).to.equal('foo')
    })

    it('should throw an error when resolving module does not fall into any category', function () {
      const fn = function () {
        return Loader.resolveUsingType({}, {}, {}, null, null, 'App/Foo', null)
      }

      expect(fn).to.throw(LoaderException)

    })

  })

  describe('Load', function () {
    it('should load all files containing functions and classes recursively inside a directory and generate thier namespaces with paths', function (done) {
      const basePath = path.join(__dirname, '/app')
      const baseNameSpace = 'App'

      Loader.generateDirectoryHash(basePath, basePath, baseNameSpace)
        .then(function (hash) {
          expect(hash).to.be.an('object')
          expect(hash['App/Services/UserService']).to.equal(path.join(__dirname + '/app/Services/UserService.js'))
          done()
        }).catch(done)
    })

  })
})
