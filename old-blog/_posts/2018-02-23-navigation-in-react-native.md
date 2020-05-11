---
layout: post
title: Navigation in React Native
author: mateusz
tags: ['react native', 'navigation']
comments: true
image: /images/navigation-in-react-native/navigation-1.jpeg
---

Navigation between screens is probably one of the very first concerns you will have while creating a React Native app. Once you start, you might be surprised that there is no built-in, fully featured navigation that will work on both platforms. Although [React Native recommends](https://facebook.github.io/react-native/docs/navigation.html) using [React Navigation](https://reactnavigation.org), you will quickly discover that this library is purely based on JavaScript and it does not directly use the native navigation APIs on iOS and Android. And as [another library says](https://github.com/wix/react-native-navigation#quick-links), if you are trying to deliver a user experience that is on par with the best native apps out there, you simply cannot compromise on JS-based components trying to fake the real thing.

![image](/images/navigation-in-react-native/navigation-1.jpeg)

## React Navigation

[React Navigation](https://github.com/react-navigation/react-navigation) is maintained by the React Native community and currently, it is the most popular React Native navigation library. It is written entirely in JavaScript and instead of using native APIs it re-creates some of their subsets. This choice was made to allow users to customize any part of the navigation experience without needing to learn iOS or Android navigation logic. Because much of the logic for React Navigation runs in JavaScript rather than in native, the usual concerns about blocking the JavaScript threads come into play. As the library [points itself](https://reactnavigation.org/docs/pitch.html), if you need the exact platform behavior you are better off using another library that wraps the platform APIs.

When you finish [configuration](https://reactnavigation.org/docs/getting-started.html) (this is purely JS-based so there is no platform specific configuration and linking), you will learn that all you need to do is to create a [`StackNavigator`](https://reactnavigation.org/docs/hello-react-navigation.html#creating-a-stacknavigator) which provides a way for your app to transition between screens and manages navigation history. This is conceptually similar to how a web browser handles navigation state, a key difference is that `StackNavigator` provides the gestures and animations similar to those on Android and iOS.

You can find a simple example of React Navigation on [this Expo snack](https://snack.expo.io/@react-navigation/our-first-navigate).

React Navigation has out-of-the-box Redux and deep linking support which together with a well-written documentation and a vibrate community makes it a reasonable choice for implementing the navigation in your app.

#### Problem

If you are rather a mobile than a web developer, sooner or later you will look for some callback after or before leaving a screen, something similar to `viewWillAppear(_:)` and other `UIViewController` methods. Although you can use `onNavigateStateChange` on the root screen and compare the previous and current state to deduce which screen has been hidden but it is nothing like what you would find in `UIViewController`.

## React Native Router

[React Native Router](https://github.com/aksonov/react-native-router-flux) is based on React Navigation but provides a different API to interact with it. It allows you to define scene transitions in one central location without having to pass navigator objects around and is easily accessible anywhere in a code.

The latest [beta version - 4](https://github.com/aksonov/react-native-router-flux), among other changes, introduces drawer support and Mob-X-powered navigation state machine that separates the navigation logic from the presentation layer.

## React Native Navigation by Wix

Another popular navigation library is [React Native Navigation](https://github.com/wix/react-native-navigation) developed by Wix. Its greatest advantage is 100% native platform navigation covered by the cross-platform interface with out-of-the-box Redux support.

You need to configure this package separately for [iOS](https://wix.github.io/react-native-navigation/#/installation-ios) and [Android](https://wix.github.io/react-native-navigation/#/installation-android) which includes linking iOS libraries, updating iOS headers search paths, extending `SplashActivity` instead of `ReactActivity` in Android `MainActivity` and a couple of additional steps that are described in details in the documentation. After you finish that, you only need to [register all your app's screens](https://wix.github.io/react-native-navigation/#/usage) and start the app. Voilà!

In React Native Navigation you can use [API very similar](https://wix.github.io/react-native-navigation/#/screen-api) to the one you would find on native platforms (and it calls native API underneath) so you can either `push` your screen or present it using `showModal` and then `pop` it or close using `dismissModal`. It has also built-in support for menu drawers, deep linking, and light boxes (alerts).

To consume both screen navigation events and deep links you should simply use `Navigator`s callback `onNavigatorEvent`:

```typescript
onNavigatorEvent(event: NavigatorEvent) {
    if (event.id === 'willAppear') {
        // do some fancy stuff
    } else if (event.type === 'DeepLink') {
        const parts = event.link.split('/')
        if (parts[0] === 'your-deep-link') {
          // navigate
        }
    }
}
```

#### v2 - work in progress

React Native Navigation has a [few issues](https://github.com/wix/react-native-navigation/tree/v2#react-native-navigation-v2-wip) which could not be resolved in its current architecture. They origin from a problem that you cannot specify on which screen you wish to make an action, which by default originate from your current screen. To resolve this, in v2 every screen receives its `containerId` as a prop and whenever you want to make an action from that screen you pass it to the function.

Version 2 is written in test-driven development (TDD) which makes accepting pull request extremely easy - if the tests pass, your pull request is accepted. You can check the [v2 roadmap](https://github.com/wix/react-native-navigation/tree/v2#v2-roadmap) to follow the development progress.

## Alternatives

![image](/images/navigation-in-react-native/navigation-2.jpeg)

If you are aiming for iOS only, you may consider using a build-in [NavigatorIOS](https://facebook.github.io/react-native/docs/navigation.html#navigatorios) which is a wrapper around the native [`UINavigationController`](https://developer.apple.com/documentation/uikit/uinavigationcontroller) component. However, if you plan to target any other platform in the future, you should consider using any other solution from the beginning.

Another alternative is [Native Navigation](http://airbnb.io/native-navigation), which is a project developed by Airbnb, one of the most-mentioned React Native adaptors. Native Navigation is currently in beta state and its authors discourage production usage of this library until it reaches a stable version, you can follow the roadmap to 1.0 [here](http://airbnb.io/native-navigation/docs/roadmap.html). The biggest challenge facing the Aribnb while decoupling this library from their internal navigation infrastructure is to accomplish the high level of extensibility, which requires them a lot of code refactoring and testing. This package doesn't have deep linking support yet and the documentation is incomplete so you should consider using any other library in a serious project.

## My weapon of choice

Personally, I find the possibility of using 100% platform native navigation in the React Native apps **the most valuable**, which is a reason why I choose [React Native Navigation](https://github.com/wix/react-native-navigation). Although I gave [React Navigation](https://github.com/react-navigation/react-navigation) a shot, I missed `UIViewController`s methods like `viewWillDisappear(_:)` or `viewDidAppear(_:)` and the truly native felling when navigating between screens. However, if you prefer a pure JavaScript library and you are not so bound to the native platform feeling, you have at least two alternatives to try out.

Regardless of which option you choose, you need to be aware of the fact that those are only 3rd party libraries and they might not work in your scenario or they may contain bugs. We had to fork and change React Native Navigation three times to avoid some problems and even though they have been already resolved in the main repository, you might encounter something new.
