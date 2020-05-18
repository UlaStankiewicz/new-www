---
layout: post
title: Injectable Android ViewModels
image: /images/injectable-android-viewmodels/syringe-1884758_1920.jpg
author: azabost
crosspost: true
hidden: false
tags: [android, kotlin, dagger, viewmodel, mvvm]
---

In the following post I'm going to show a simple (almost boilerplate-free) yet powerful implementation of the view models dependency injection on Android using Dagger.

If you haven't read about the latest [Android Architecture Components libraries](https://developer.android.com/topic/libraries/architecture/.html), the MVVM pattern and the [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel.html) class yet, please read it first as I don't explain it here.

# The Android weaknesses #

I think the fact that Google has decided to help developers by creating their own library for supporting the MVVM pattern on the Android platform was a really good move.

A few months before its release I was wondering what was the best approach to introduce the MVP or MVVM pattern on Android. I have tested or reviewed a few libs on GitHub and none of them seemed good enough for me - either due to their limitations or a huge amount of boilerplate code they required. Also the way they were implemented and the number of reported bugs were not encouraging.

I was envious of the simple approach the iOS developers have - they can instantiate a view controller on their own and pass a view model directly to it (e.g. via the constructor). The iOS system also doesn't kill the view controller when the screen orientation changes so it doesn't have to obtain the view model again and, at the same time, the view model gets destroyed with the view controller when it's not needed anymore (provided that you don't hold another reference to it).

But on Android you start with an activity component and you can't prepare the view model outside of its lifecycle easily. Also storing the reference to the view model only in the activity which gets destroyed on every configuration change (like screen orientation) will destroy the view model as well and it's not convenient. If you would like the view model to survive, you would have to hold a reference to it somewhere else but then another problems arise e.g. how to clean the view model when it's not needed anymore or how to make every activity of the same class to use a different view model instance.

The Google's `ViewModel` was designed to help with such issues. Unfortunately, it still needs to be created during the activity lifecycle but with several Dagger tweaks you can easily inject any view model's dependencies to it.

![Injection](/images/injectable-android-viewmodels/syringe-1884758_1920.jpg){: .center-image}

# Injectable ViewModels #

Before we begin to play with the code I wanted to add that I have googled other people's approaches to view model injections and I didn't like them too much because of the significant amount of the boilerplate code (e.g. writing a separate view model factory per view model). The ~~best one~~ _(not any more - read the note below)_, which my example is based on, comes from the [Google's samples repository](https://github.com/googlesamples/android-architecture-components/tree/master/GithubBrowserSample). I have simplified some parts of it and rewritten it in Kotlin.

_Note: you can access the whole code used in this example [on GitHub](https://github.com/azabost/simple-mvvm-example/tree/7b051fd7a16853e3d9655767a887d9a830133d2d)._

_Another note: if you would like to read about a newer solution for injecting ViewModels which I find better, [click here](https://brightinventions.pl/blog/android-viewmodel-injections-revisited/)._

## Simple factory ##

The default library's factory instantiates view models using empty constructors. Of course, we can't use it as we are going to create the view models with non-empty constructors, passing the dependencies obtained from Dagger.

The `ViewModelProvider.Factory` interface defines only one method:

```java
@NonNull
<T extends ViewModel> T create(@NonNull Class<T> modelClass);
```

As you can see, it takes the class of a view model and it must return its instance.

In order to use a single simple and universal factory (which is the main point of this post) for all the view models we need to create a map of `Provider`s for every view model class. While I was analysing the mentioned Google's sample I didn't know how the map generation works and it wasn't very easy to understand so I'm going to exaplain it a little more here to save you the trouble.

### Generating the map ###

If you have already used Dagger, you might have also noticed the code it generates. Most of that code are the `Component`s, `Provider`s, `Factory`s etc. The `Provider` is an object which *provides* the instances of some class (`Factory` is also a `Provider`).

The `MapKey` annotation ([docs](https://google.github.io/dagger/api/2.13/dagger/MapKey.html)) lets you generate a map of objects provided by Dagger or the `Provider`s of those objects. In our example we will need the following map:

`Map<Class<? extends ViewModel>, Provider<ViewModel>>`

which can be translated to Kotlin as:

`Map<Class<out ViewModel>, @JvmSuppressWildcards Provider<ViewModel>>`

_Note: Dagger generates Java sources and that's why we must remember about the variance differences between Java and Kotlin ([generics docs](https://kotlinlang.org/docs/reference/generics.html), [Java to Kotlin interoperability docs](https://kotlinlang.org/docs/reference/java-to-kotlin-interop.html)) which could be troublesome if you don't use the `@JvmSuppressWildcards` annotation, resulting in this error:_

> error: [dagger.android.AndroidInjector.inject(T)] java.util.Map<java.lang.Class<? extends android.arch.lifecycle.ViewModel>,? extends javax.inject.Provider<android.arch.lifecycle.ViewModel>> cannot be provided without an @Provides-annotated method.

This map's entries consist of a key - a class of any view model and a value - a `Provider` of any view model. Obviously, we must feed the map with the corresponding `Provider`s for every view model, e.g. `ViewModelA -> Provider<ViewModelA>`. With such a map the factory will be able to easily return an instance of any view model with all its dependencies fulfilled by Dagger.

In order to generate the map we need two elements: a map key definition and a module with view model _bindings_.

The map key definition is an annotation type which has a single member whose type is the map key type. It may look like this:

```kotlin
import android.arch.lifecycle.ViewModel
import dagger.MapKey
import kotlin.reflect.KClass

@MustBeDocumented
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@MapKey
annotation class ViewModelKey(val value: KClass<out ViewModel>)
```

And then we can use it in a module like below.

```kotlin
import android.arch.lifecycle.ViewModel
import com.azabost.simplemvvm.ui.main.MainViewModel
import dagger.Binds
import dagger.Module
import dagger.multibindings.IntoMap

@Module
abstract class ViewModelModule {

    @Binds
    @IntoMap
    @ViewModelKey(MainViewModel::class)
    abstract fun bindMainViewModel(mainViewModel: MainViewModel): ViewModel
}
```

`@Binds` methods are a drop-in replacement for `@Provides` methods that simply return an injected parameter. Combining it with `@IntoMap` and our key (`@ViewModelKey`) will put a provider of the returned object into the map under the key specified by the key annotation's parameter. In this case the `Provider<MainViewModel>` instance will be put under the `MainViewModel::class` key. Kotlin will also translate the `KClass` into `Class` for Java compatibility.

_Note: you may want to read the `Binds` [docs](https://google.github.io/dagger/api/2.13/dagger/Binds.html), `IntoMap` [docs](https://google.github.io/dagger/api/2.13/dagger/multibindings/IntoMap.html) and multibindings [docs](https://google.github.io/dagger/multibindings.html)._

### Using the map in the factory ###

The view model factory which uses the generated map will be as simple as this:

```kotlin
import android.arch.lifecycle.ViewModel
import android.arch.lifecycle.ViewModelProvider
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

@Singleton
class InjectingViewModelFactory @Inject constructor(
        private val viewModelProviders: Map<Class<out ViewModel>, @JvmSuppressWildcards Provider<ViewModel>>
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val provider = viewModelProviders[modelClass]
                ?: viewModelProviders.entries.first { modelClass.isAssignableFrom(it.key) }.value

        return provider.get() as T
    }
}
```

And we can also add it to the same Dagger module:

```kotlin
import android.arch.lifecycle.ViewModel
import android.arch.lifecycle.ViewModelProvider
import com.azabost.simplemvvm.ui.main.MainViewModel
import dagger.Binds
import dagger.Module
import dagger.multibindings.IntoMap

@Module
abstract class ViewModelModule {

    @Binds
    @IntoMap
    @ViewModelKey(MainViewModel::class)
    abstract fun bindMapViewModel(mapViewModel: MainViewModel): ViewModel

    @Binds
    abstract fun bindViewModelFactory(factory: InjectingViewModelFactory): ViewModelProvider.Factory
}
```

## Obtaining view models ##

In the activity you can now inject the factory:

```kotlin
@Inject
lateinit var vmFactory: ViewModelProvider.Factory
```

and use it to obtain the view model:

```kotlin
val vm = ViewModelProviders.of(this, vmFactory).get(MainViewModel::class.java)
```

Don't forget to annotate your view model's constructor with `@Inject`:

```kotlin
class MainViewModel @Inject constructor(
        private val gitHubClient: GitHubClient
) : ViewModel(), MainVM, LoadingVM, DataVM {
    ...
}
```

If it seems too complicated to you, please take a look at the diagram below. It may help you to see the big picture.

![Diagram](/images/injectable-android-viewmodels/diagram.png){: .center-image}
