---
layout: post
title: iOS Google configuration per environment
author: mateusz
tags: ['ios', 'xcode', 'build configurations']
comments: true
hidden: true
---

If you have ever used [Google Sign-In](https://developers.google.com/identity/sign-in/ios/start), [Firebase](https://firebase.google.com/docs/ios/), or [Google Analytics](https://developers.google.com/analytics/devguides/collection/ios/v3/) for iOS, you should be familiar with `GoogleService-Info.plist` configuration file. Using property list files instead of setting every required property manually in code is convenient, especially when using more than one Google service at once and the configuration grows. But did you ever wonder how can this be adjusted to multiple environments?

## Environments

To setup multiple environments in iOS application I use **build configurations**. By default, every iOS app has two build configurations: Debug and Release. In our projects, we usually have three:

- Develop - application for developers with debug enabled, usually connecting to the Stage backend.
- Stage - signed application connecting to the Stage backed for early TestFlight testing.
- Prod - signed application connecting to the production backend, published to the store after UAT (User Acceptance Testing) on TestFlight.

You can define these under project settings ([PROJECT]->Info).

![image](/images/ios-google-configuration-per-environment/build-configurations.png)

Build configurations lets you easily use different **User-Defined settings** for each configuration. You can define these at the bottom of target build settings ([TARGET]->Build Settings).

![image](/images/ios-google-configuration-per-environment/user-defined-settings-1.png)

![image](/images/ios-google-configuration-per-environment/user-defined-settings-2.png)

Respectively, you can use User-Defined settings in the **Info.plist** file.

![image](/images/ios-google-configuration-per-environment/info-plist.png)

In the example above, the application will use different `FacebookAppID` properties for each build configuration. `FacebookAppID` property is automatically used by the [Facebook SDK for iOS](https://developers.facebook.com/docs/ios/), but you can also refer those values directly in the code:

```swift
if let path = Bundle.main.path(forResource: "Info", ofType: "plist"),
   let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject] {
    // read values from dict
}
```

## Google configuration

One might think that you can do the same with `GoogleService-Info.plist` configuration file. **Unfortunately, you can not read User-Defined settings from custom property list files**, you can only do that in the Info.plist files defined in target Build Settings.

Considering there can be only one `GoogleService-Info.plist` file and it is not possible to read User-Defined settings from custom .plist files, how would you setup different Google configuration for each environment?

![image](/images/ios-google-configuration-per-environment/sad.jpeg)

## Run Scripts to the rescue

Fortunately, you can add new **Run Script Phase** to target Build Phases that will **copy a proper Google configuration file** to default `GoogleService-Info.plist` place.

![image](/images/ios-google-configuration-per-environment/run-script-phase-1.png)

The script is really simple and it only copies plist file from Resources using predefined `CONFIGURATION` variable that points to the build configuration. In the example configuration above, it replaces `GoogleService-Info.plist` file content with one of the following files stored in Resources:

- GoogleService-Info-Develop.plist
- GoogleService-Info-Stage.plist
- GoogleService-Info-Prod.plist

```bash
cp "${SRCROOT}/src/Resources/GoogleServiceInfoPlists/GoogleService-Info-$CONFIGURATION.plist" "${SRCROOT}/src/GoogleService-Info.plist"
```

`SRCROOT` is also predefined and it points to project location.

Note that `src/GoogleService-Info.plist` must be added to target **Copy Bundle Resources** build phase, while resources Google configuration files not necessarily.

#### Caution!

Run script that updates `GoogleServiceInfo.plist` file must be dragged **before Copy Bundle Resources** phase. Otherwise, it will not work because the default Google configuration file will be used.

![image](/images/ios-google-configuration-per-environment/run-script-phase-2.png)

## Alternatives

Alternatively, you can set Google Client ID and other Google configuration properties directly in the code, for example:

```swift
GIDSignIn.sharedInstance().clientID = "CLIENT_ID"
```

To keep different Google configuration for each environment you can read a proper Google plist file according to build configuration or store Google configuration on your own, without property list files.

To determine build configuration at runtime you can use **Other Swift Flags** in target Build Settings. For each build configuration add flag starting with `-D`, like `-DDEVELOP`.

![image](/images/ios-google-configuration-per-environment/other-swift-flags.png)

Then you can easily determine build configuration at runtime:

```swift
#if DEVELOP
    // Develop
#elseif STAGE
    // Stage
#elseif PROD
    // Prod
#endif
```

This post was inspired by [this StackOverflow topic](https://stackoverflow.com/q/34067120/1570496).