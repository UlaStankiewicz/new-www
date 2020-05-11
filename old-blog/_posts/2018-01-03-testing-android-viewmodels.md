---
layout: post
title: Testing Android ViewModels
image: /images/testing-android-viewmodels/stethoscope.jpg
author: azabost
crosspost: true
comments: true
hidden: false
tags: [android, kotlin, viewmodel, mvvm, unit tests]
---

In my [previous post](https://brightinventions.pl/blog/injectable-android-viewmodels/) I described how to implement injectable Android view models using Dagger and [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel.html) library from [Android Architecture Components](https://developer.android.com/topic/libraries/architecture/.html). In this post I will show a simple way to unit test the view model created then. You can find the full code in the same repository as previously [on GitHub](https://github.com/azabost/simple-mvvm-example/tree/7b051fd7a16853e3d9655767a887d9a830133d2d).

# The structure #

![Structure](/images/testing-android-viewmodels/structure.svg){: .center-image}

The `MainViewModel` view model exposes three [RxJava](https://github.com/ReactiveX/RxJava) `Observable`s which Activity (`MainActivity`) subscribes to in order to receive notifications, e.g. to display an error message. There is also the `getRepo` function that triggers fetching some data from the GitHub API and the `data` variable that stores the fetched data.

The mentioned members are divided into three interfaces implemented by the view model but it's mainly for the clarity of the example (you can easily tell which members are used by the Activity and the Fragments).

The only view model's dependency (provided by Dagger) is `GitHubClient` which has a method for fetching some data.

It's also worth noting that the Activity and the Fragments use the same instance of `MainViewModel`. That's why it can both fetch the data when `LoadingFragment` requests it, tell `MainActivity` to show an error if anything goes wrong and work as a data store for `DataFragment`. In order to achieve this type of sharing the view model instance between the Activity and the Fragments, they must request the view model by passing the Activity reference while getting it:

`ViewModelProviders.of(activity, vmFactory).get(...)`

![Stethoscope](/images/testing-android-viewmodels/stethoscope.jpg){: .center-image}

# Testing #

## Prepare dependencies ##

Normally `MainViewModel` uses a `GitHubClient` implementation that calls the GitHub API using [Retrofit](https://github.com/square/retrofit) HTTP client. In tests you would probably prefer to either mock the server (e.g. with [MockWebServer](https://github.com/square/okhttp/tree/master/mockwebserver)) or just the `GitHubClient` implementation so that it won't make the calls at all. In this example I'm going to use the latter approach (but testing the calls to a mocked server is also a good idea and you can do it separately).

### Mock API client ###

The mocked implementation of the `GitHubClient` is very simple. Its constructor accepts a response it should return, an optional error it should throw instead of the response and a scheduler so that we can control the exact moment the data/error is returned. The error and the response are mutable properties so we can adjust them just before calling `getRepo` method.

```kotlin
import com.azabost.simplemvvm.net.response.RepoResponse
import io.reactivex.Observable
import io.reactivex.Scheduler

class MockGitHubClient(
        val scheduler: Scheduler,
        var repoResponse: RepoResponse = RepoResponse(1),
        var error: Throwable? = null
) : GitHubClient {

    override fun getRepo(owner: String, repo: String): Observable<RepoResponse> {
        val response = error?.let { return Observable.error(it) } ?: Observable.just(repoResponse)
        return response.subscribeOn(scheduler).observeOn(scheduler)
    }
}
```

_Note: it can also be implemented using Mockito - you can find the updated version on GitHub._

### Setting things up ###

I put all the `MainViewModel` tests in the `MainViewModelTests` class. It has a few properties:

* `MainViewModel`
* `TestObserver`s for every `Observable` exposed by `MainViewModel`
* `MockGitHubClient`
* `TestScheduler` that is passed to `MockGitHubClient`

They are initialized in the `setup` method.

`TestObserver`s record events passed by `Observable`s and they allow to make assertions about them e.g. if a value has been emitted and what it was exactly.

`TestScheduler` controls the time when `MockGitHubClient` emits responses so that we can defer it and test what happens before the subscription completes (e.g. the progress animation should be still visible).

```kotlin
class MainViewModelTests {
    lateinit var vm: MainViewModel
    lateinit var gitHubClient: MockGitHubClient
    lateinit var testScheduler: TestScheduler
    lateinit var progressObserver: TestObserver<Boolean>
    lateinit var errorObserver: TestObserver<Int>
    lateinit var showDataObserver: TestObserver<Unit>

    @Before
    fun setup() {
        testScheduler = TestScheduler()
        gitHubClient = MockGitHubClient(testScheduler)
        vm = MainViewModel(gitHubClient)
        setupObservers(vm)
    }

    fun setupObservers(vm: MainViewModel) {
        progressObserver = TestObserver.create()
        vm.progress.subscribe(progressObserver)
        errorObserver = TestObserver.create()
        vm.errors.subscribe(errorObserver)
        showDataObserver = TestObserver.create()
        vm.showData.subscribe(showDataObserver)
    }
```

## Writing some tests ##

Below you can find three simple examples.

### Example 1 ###

Test if positive response from the API triggers `showData` `Observable` and stores the data for later usage in the `data` variable.

```kotlin
@Test
fun getRepoShouldShowData() {
    val data = RepoResponse(12345)
    gitHubClient.repoResponse = data

    vm.getRepo("any", "thing")
    testScheduler.triggerActions()

    showDataObserver.assertValueCount(1)
    vm.data.shouldEqual(data)
}
```

_Note: the `shouldEqual` method comes from [ShouldKO](https://github.com/miensol/shouldko) which I really recommend but you can use any assertions you like._

### Example 2 ###

Test if HTTP exception triggers `error` `Observable` with the HTTP-specific error message.

```kotlin
@Test
fun getRepoErrorShouldShowHttpError() {
    gitHubClient.error = HttpErrors.getHttpException(404)

    vm.getRepo("any", "thing")
    errorObserver.assertValue(HttpErrors.DEFAULT_HTTP_ERROR_MESSAGE)
}
```

### Example 3 ###

Test if calling `getRepo` triggers `progress` `Observable` twice so that it should tell the view to show the loader and then to hide it.

```kotlin
@Test
fun getRepoShouldShowProgress() {
    vm.getRepo("any", "thing")
    progressObserver.assertValue(true)

    testScheduler.triggerActions()
    progressObserver.assertValueSequence(listOf(true, false))
}
```

# Conclusion #

As you can see, using `ViewModel`s and RxJava `Observable`s gives a very simple way to write unit tests for your code. I believe this great possibility will also encourage you to extract the business logic from the Android application components like Activities so that it can be tested without using instrumented tests or mocking the platform (e.g. with Robolectric).
