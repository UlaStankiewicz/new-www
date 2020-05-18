---
layout: post
title: Different iOS build configurations than Debug and Release in React Native
author: mateusz
tags: ['react native', 'ios', 'build configurations']
comments: true
image: /images/react-native-custom-ios-build-configurations/build-configurations.png
---

Default iOS build configurations, **Debug** and **Release**, might be enough for the beginning, but sooner or later you will probably need to extend the number of build configurations in your app. While this is pretty straightforward in native development, unfortunately, it is not in React Native.

## Build configurations

To manage build configuration go to Xcode the project settings ([PROJECT]→Info):

![image](/images/react-native-custom-ios-build-configurations/project-target.png)

You can easily add a new build configuration by **duplicating an existing one**. Duplicate Debug configuration for development and Release configuration for Test Flight and App Store build. You can also rename any configuration by double-clicking on it quickly.

![image](/images/react-native-custom-ios-build-configurations/build-configurations.png)

#### Debug vs Release

Debug configuration builds the complete symbolic debug information without any code optimizations to facilitate debugging applications. In Release configuration code execution is optimized and symbolic information is not included in build which results in a smaller size of the final executable. Release builds will execute faster although due to compiler optimizations you can expect differences in memory layout or initialization which might result in so-called "Release-only" bugs.

#### Run build configuration

The steps presented above steps are enough to set up new build configurations in a native development. To run the app in build configuration open **scheme** and change Run build configuration:

![image](/images/react-native-custom-ios-build-configurations/select-build-configuration.png)

## Problems in React Native

To start the iOS app with build configuration specified in React Native you can simply run:

```react-native run-ios --configuration Stage```

Unfortunately, this will fail for any Release-based configuration with an error saying that it cannot find `RCTBundleURLProvider` in AppDelegate:

> AppDelegate.m:2:9: 'React/RCTBundleURLProvider.h' file not found

We need to add missing **Header Search Paths** and **Library Search Paths** in the target build settings ([TARGET]→Build Settings) for new Release build configurations.

![image](/images/react-native-custom-ios-build-configurations/build-settings-search-paths.png)

Add an entry to **Headers Search Paths** for each new Release build configuration:

```$(BUILD_DIR)/Release-$(PLATFORM_NAME)/include```

![image](/images/react-native-custom-ios-build-configurations/header-search-paths.png)

Add an entry to **Library Search Paths** for each new Release build configuration:

```$(BUILD_DIR)/Release$(EFFECTIVE_PLATFORM_NAME)```

![image](/images/react-native-custom-ios-build-configurations/library-search-paths.png)

**Next, do the same for all Test targets**, otherwise the command will still fail.

Eventually, you can start the app with specified build configuration:

```react-native run-ios --configuration Stage```

and it should run without any problems.

One might wonder why this is needed when we only change build configuration name and it was already working for Release. **React Native supports Debug and Release build configurations out of the box**, while any other configuration needs to be set up manually.

## Every cloud has a silver lining

Defining iOS build configurations different than Debug and Release in React Native can be really frustrating without any previous experience. However, with a little guidance, it can be a quick and painless process.

If you are interested in how to set up different Google configurations for each build configuration I recommend you [reading this tutorial](https://brightinventions.pl/blog/ios-google-configuration-per-environment). Although it is written for native development, you can **set up Run Scripts exactly the same in React Native**.
