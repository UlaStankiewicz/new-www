---
layout: post
title: Android - Koin DI
author: szymek
hidden: false
tags: [blog, android, koin, DI, dagger, mobiledev, mobile]
---

In Android injecting parameters, managing component's lifecycle and creating various scopes is difficult and crucial, but fortunately, we've got [DI (Dependency Injection)](https://en.wikipedia.org/wiki/Dependency_injection) technique for the rescue.

<p align="center">
  <img src="/images/android-koin/android_photo.jpg">
</p>

Right now the most known Android DI tool is Dagger 2 maintained by Google. We have been using it in many projects. It's great, but lately the other player has showed up. Let's talk about Koin!

Nowadays writing Android Application in Kotlin is getting more and more popular, hence new libraries are showing up! Koin is a 'pragmatic lightweight dependency injection' [dsl (Domain-Specific language)](https://en.wikipedia.org/wiki/Domain-specific_language) Kotlin framework. It's not based on reflection and code generation either. The way it works is different than Dagger and it could be described as a [service locator](https://en.wikipedia.org/wiki/Service_locator_pattern). It’s regarded as an anti-pattern, but in my opinion it depends on the job it needs to do. With this tool you can easily create modules, inject dependencies and manage Android components lifecycles or scopes. It could be useful when method count, build speed and a size of your APK matters due to not generating code. 

#### Core features:
* Creating modules, submodules consisting of singleton and factory providers
* Creating session scopes managed wherever you want in your code
* Creating global named properties
* Binding to component's lifecycle
* Android Architecture Component support


## Let's see few lines of code
Class providing us with current weather
```
  class WeatherProvider {
    fun getCurrentWeather(): String {
      return "It's sunny! As always in this beautiful city of Gdańsk!”
    }
  }
```
Weather module creation with single instance of `WeatherProvider`:
```
  val weatherModule = {
    single { WeatherProvider() }
  }
 ```
Initialize Koin:
```
  startKoin(listOf(weatherModule))
```
Now we can use our `WeatherProvider` wherever we want by injecting it in this way:
```
  val weatherProvider: WeatherProvider by inject()
```
And that's it! The `WeatherProvider` singleton is ready to use.

You can also bind `WeatherProvider` per Activity which will depend on its lifecycle or create a special scope for your needs opened and closed whenever you want.

For more information visit official [Getting Started](https://insert-koin.io/docs/1.0/getting-started/introduction/) section.

## Summary
Koin has a great Kotlin feeling, dsl syntax, no annotations, no boilerplate and is pretty easy to implement. The other important thing are - errors. Koin provides us with clean and reasonable error logs. If you make a mistake in your implementation it's really effortless to localize and fix a problem. You can even bind your own logger to it while initializing.
Nevertheless there are few concerns. Would it be causing headaches for large teams due to resolving what is injected where? Will a performance extremely decrease with the increasing quantity of dependencies? I guess we need to find out!

