---
layout: post
title: Don't fool yourself with lateinit modifier
image: /images/dont-fool-yourself-with-lateinit-modifier/risk_inside.jpg
author: azabost
date: 2018-03-22
crosspost: true
comments: true
hidden: false
tags: [android, kotlin]
---

Kotlin language provides a nice and clean way to handle nullable variables in code so that it is less error prone. Unless you do it all wrong, of course.

# lateinit modifier #

Normally, all non-nullable properties in Kotlin classes must be properly initialized. You can do it in several ways:

* in primary constructor,
* in initializer block(s),
* in the class body,
* with a getter*,
* with a delegate*.

_* Well, it's not an initialization per se, but it makes compiler aware that's not `null`_

But if your property is lifecycle-driven (e.g. a reference to a button which gets inflated during Android Activity lifecycle) or it is initialized through injection, you cannot supply a non-null initializer and you must declare its type as nullable. This in turn will require you to use null checks every time you reference the property, which may be a bit inconvenient, especially if you are absolutely sure the property will get initialized at some point, before you access it for the first time.

Kotlin has a simple solution for such a scenario, allowing you to mark the property with the `lateinit` modifier. Thanks to this you can have a non-nullable type so that you don't have to check if it's `null` while referencing it. Of course, if you access the property before initialization, you'll get an `UninitializedPropertyAccessException`.

# Lateinits vs nullables #

The described possibility, despite being a great feature, may also be tempting to overuse in places where the initialization is not so certain (e.g. conditional or just _too late_), making the code less null-aware, less predictable and more like Java, thus - naturally - you might be doubtful if certain usages are right or not. So here's my rule of thumb that I use when making decision if particular variable should be `lateinit` or just nullable. It's very subjective and it tends to change with time so feel free to share your own experiences in comments.

## Lateinit #1: beginning of a lifecycle ##

You can intialize properties when your classes' lifecycle-beginning methods get invoked, e.g. `Activity.onCreate()`. It's a common case if you use a dependency injection framework like [Dagger](https://google.github.io/dagger/).

```kotlin
abstract class BaseActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        AndroidInjection.inject(this)
        super.onCreate(savedInstanceState)
    }
}

class LoginActivity : BaseActivity() {

    @Inject
    lateinit var viewModelFactory: ViewModelProvider.Factory

    lateinit var viewModel: LoginViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        viewModel = ViewModelProviders.of(this, viewModelFactory).get(LoginViewModel::class.java)

        setContentView(R.layout.login_activity)
    }
}
```

It's also very useful if you want to `getSystemService()`:

```kotlin
class MainActivity : AppCompatActivity() {

    lateinit var alarmManager: AlarmManager

    // This wouldn't work:
    // val alarmService = getSystemService(AlarmManager::class.java)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        alarmManager = getSystemService(AlarmManager::class.java)
}

```

Otherwise you would get an `IllegalStateException` saying that system services are not available to Activities before `onCreate()`.

You can also avoid the `this` reference escape during object construction [for thread-safety](https://wiki.sei.cmu.edu/confluence/display/java/TSM01-J.+Do+not+let+the+this+reference+escape+during+object+construction):

```kotlin
class MyActivity : AppCompatActivity() {

    lateinit var alien: Alien
    // instead of:
    // val alien = Alien(this)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        alien = Alien(this)
    }
}
```

## Lateinit #2: fail-fast approach ##

You may prefer to write a code that is designed to fail as soon as possible and stop normal operation rather than attempt to continue a flawed process. An extreme case could be crashing the app so that you can detect failures early. It can be especially useful in situations where the code is straightforward and predictable.

For example, let's imagine an Activity that uses `MediaPlayer` to play music. It might look like this:

``` kotlin
class PlayerActivity : AppCompatActivity() {

    lateinit var mediaPlayer: MediaPlayer
    lateinit var mediaUri: Uri

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)
        mediaUri = intent.getParcelableExtra("mediaUri")
    }

    override fun onStart() {
        super.onStart()
        mediaPlayer = MediaPlayer()
        mediaPlayer.setDataSource(this, mediaUri)
        mediaPlayer.prepare()
        mediaPlayer.start()
    }

    override fun onStop() {
        super.onStop()
        mediaPlayer.stop()
        mediaPlayer.release()
    }
}
```

It's quite easy to spot a risky assignment in `onCreate` as retrieving `mediaUri` from the passed intent may end up with an exception if the intent did not contain it.

`java.lang.IllegalStateException: intent.getParcelableExtra("mediaUri") must not be null`

On the other hand, the code is clear and simple and it's not too hard to test it. But if you feel your specific case needs a bit of explanation then I encourage you to document such design decision.

![Risk inside](/images/dont-fool-yourself-with-lateinit-modifier/risk_inside.jpg){: .center-image}

## Nullable #1: crash-free approach ##

There might be cases when you would like to avoid crashing the app at all cost, even if something is not going to work properly. It doesn't mean that using `lateinit` like in the previous "fail-fast" example must end up with a crash as you can catch the exceptions, but I think it's quite common to choose between these two extremes: either let the app crash and don't mind catching the exceptions or avoid crashing using nullable variables.

Let's modify the previous example by replacing `lateinit`s with nullable types:

``` kotlin
class PlayerActivity : AppCompatActivity() {

    var mediaPlayer: MediaPlayer? = null
    var mediaUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)
        mediaUri = intent.getParcelableExtra("mediaUri")
    }

    override fun onStart() {
        super.onStart()

        mediaUri?.let {
            val player = MediaPlayer()
            player.setDataSource(this, it)
            player.prepare()
            player.start()
            mediaPlayer = player
        }
    }

    override fun onStop() {
        super.onStop()
        mediaPlayer?.stop()
        mediaPlayer?.release()
    }
}
```

So this time, if we don't get any `mediaUri`, we just don't play the music. The app won't crash, but the user will be surprised by the silence (he might even wonder if his phone is broken). Is it better than crashing? That's your choice. But the good thing about this approach is that you have an opportunity to actually test the variable using a regular `if` statement and do something else if it wasn't initialized with a non-null value.

_Note: since Kotlin 1.2 you can use `.isInitialized` on a reference to a `lateinit` property, but it may render your code even more unreadable and it has some limitations (see [the docs](https://kotlinlang.org/docs/reference/properties.html)):_
> This check is only available for the properties that are lexically accessible, i.e. declared in the same type or in one of the outer types, or at top level in the same file.

## Nullable #2: very late initialization ##

I've seen a piece of code that was "remembering" a clicked list item data in a `lateinit` variable, starting another Activity with `startActivityForResult()` and finally, when it has finished and `onActivityResult()` was called, the "remembered" value was read and used (and I was quite surprised it hasn't been lost in the meantime).

```kotlin
class SomeActivity : AppCompatActivity() {

    lateinit var selectedItemData: ItemData

    // a ton of code ...

    private fun doSomethingWithItem(data: ItemData) {
        // another ton of code ...

        if (...) { // long and complex conditions
            if (...) {
                data?.anotherData?.let { // may not happen and won't let you know
                    selectedItemData = data
                    startActivityForResult(...)
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        doSomethingElse(selectedItemData)
    }
}
```

Generally speaking, I avoid such constructions and I call them "too late initialization". In such cases I prefer to use a nullable type instead to make it clear the variable is `null` most of the time.

# How not to fool yourself? #

Make the property nullable if it makes better sense and improves null safety. `lateinit` might be good if used properly but it has its cons as well. Don't make it a replacement for `NullPointerException`.
