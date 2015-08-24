# Ioc container api expectations.

Here we mentioned on how api should be consumed , after all that is what matters.

## Namespaces

Before you start using fold , you should be aware about namespaces , name-spacing is a way of defining classes or modules under a unique name so they should not override each other.

Namespaces also helps in keeping your references more readable as well structured names instead of `../../` back referenc modules.

## Auto Loading.

Auto loading is a better way to register components to the ioc container and get them back
in more expressive way.

### Right now
```javascript
const UserService = require('../../services/UserService')
```

### With Fold
```javascript
// more readable
const UserService = use("App/Services/UserService")
```

## Service Providers.

Service providers help you in registering self created and 3rd party modules , which can use dependency injection out the box.
All service providers should follow below rules.

1. Service providers have to be es6 classes only.
2. Service providers should extend `ServiceProvider` class.
3. Service providers should implement `register` function.
4. Register function should do all work for injecting services into application layer.

### Example

```javascript
class DatabaseServiceProvider extends ServiceProvider{

  *register(){
    this.app.bind('App/Database',function(){
      return new Database()
    });
  }

}
```

You can also inject other service providers in your service provider.

```javascript
class CacheServiceProvider extends ServiceProvider{

  static get inject(){
    return ["App/Database"]
  }

  *register(){
    this.app.bind('App/Cache',function(Database){
      return new Cache(Database)
    });
  }

}
```

As javascript does not allow you to inject classes with a namespace, you need to have a `static inject` property on your service provider to define injections.

**Or you can leverage the power of type hinting.**

Type hinting will inspect your `Closure` on bind method and will try to fulfill dependencies by converting them from `camelcase` properties to proper namespaces.

So `App_Database` becomes `App/Database`

#### Cache service with type hinting.

```javascript
class CacheServiceProvider extends ServiceProvider{

  *register(){
    this.app.bind('App/Cache',function(App_Database){
      return new Cache(App_Database)
    });
  }

}
```
