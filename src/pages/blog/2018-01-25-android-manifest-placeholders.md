---
layout: post
title: Android Manifest placeholders
image: /images/android-manifest-placeholders/placeholder.png
author: azabost
crosspost: true
comments: true
hidden: false
tags: [android, gradle, manifest]
---
# What are they? #

[Android Manifest placeholders](https://developer.android.com/studio/build/manifest-build-variables.html) allow you to put variables into the Manifest that is otherwise completely static. Why would you need such functionality? Actually, it depends on your projects. It's probably most useful when you have multiple [build variants](https://developer.android.com/studio/build/build-variants.html) with different Manifest configurations.

# Multiple Manifests #

Of course, the easiest way to configure Manifest per build variant is to place a separate `AndroidManifest.xml` file in the variant-specific source directory. For example let's say we have an `app` module with [flavor dimension](https://developer.android.com/studio/build/build-variants.html#flavor-dimensions) called `features` with two flavors: `paid` and `free`. In Gradle file it could look like this:

```groovy
android {
    ...
    buildTypes {
        release {...}
        debug {...}
    }

    flavorDimensions "features"

    productFlavors {
        paid {
            dimension "features"
            ...
        }
        free {
            dimension "features"
            ...
        }
    }
}
```

This enables us to use different source sets, including Manifest files. If we would like to separate `paid` and `free` configurations, we could place different Manifests in the following project directories:

* `app/src/paid/AndroidManifest.xml`
* `app/src/free/AndroidManifest.xml`

We could also use fully qualified build variants (combining product flavors with build types):

* `app/src/paidDebug/AndroidManifest.xml`
* `app/src/paidRelease/AndroidManifest.xml`
* `app/src/freeDebug/AndroidManifest.xml`
* `app/src/freeRelease/AndroidManifest.xml`

_Note #1: Source sets are not created automatically. You can create them by hand or using **Source set** dropdown menu while creating a new file or directory in Android Studio._

_Note #2: If you would like to make sure how to organize the source sets, you can run Gradle `sourceSets` task, e.g. with `./gradlew sourceSets` or Android Studio Gradle menu._

While using multiple Manifest files gives the best flexibility (you can change literally everything), the maintenance may be troublesome for several reasons, e.g.:

* changing anything requires editing every file,
* comparing multiple files and finding differences is not convenient.

![Placeholder](/images/android-manifest-placeholders/placeholder.png){: .center-image}

# Using placeholders #

So instead of using multiple files I always strive to use some variables. In order to use a variable in the Manifest we must specify it in the `manifestPlaceholders` property in Gradle. We can do this in several places, e.g.:

* default config

```groovy
android {
    ...
    defaultConfig {
        manifestPlaceholders.screenOrientation = "unspecified"
    }
}
```

* product flavor

```groovy
android {
    ...
    flavorDimensions "features"

    productFlavors {
        paid {
            dimension "features"
            manifestPlaceholders.hostName = "www.paid-example.com"
        }
        free {
            dimension "features"
            manifestPlaceholders.hostName = "www.free-example.com"
        }
    }
}
```

* build type

```groovy
android {
    ...
    buildTypes {
        release {
            ...
            manifestPlaceholders.screenOrientation = "portrait"
        }
        debug {...}
    }
}
```

_Note #1: `manifestPlaceholders` object is just a `Map<String, Object>` so you can also use its other methods like `containsKey()` etc._

_Note #2: You can also specify all the values at once by assigning a map like this: `manifestPlaceholders = [...]`_

Then we can use the variables in the Manifest simply by putting the variable name in curly brackets and using a dollar sign like this:

```xml
<activity
    android:name=".MyActivity"
    android:screenOrientation="${screenOrientation}" />
```

# Applications #

I've come across a few common usages of the placeholders, e.g.:

* enabling/disabling [application components](https://developer.android.com/guide/components/.html) and meta-data, including the ones that come with your app's dependencies

```xml
<service
    android:name=".firebase.FcmIdService"
    android:enabled="${pushNotifications}">
    ...
</service>

<provider
    android:name="android.support.v4.content.FileProvider"
    android:authorities="${fileProvider}"
    ... >
    ...
</provider>
```

* overriding screen orientation in portrait-only apps so that you can rotate it in debug builds which may be useful when looking for lifecycle related memory leaks

```xml
<activity
    android:name=".MyActivity"
    android:screenOrientation="${screenOrientation}" />
```

* using different deep links configuration

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="app" android:host="${deepLinkHost}" />
</intent-filter>
```

* removing `SYSTEM_ALERT_WINDOW` permission from React Native based release builds (this seems quite hacky though; you can find the original issue [here (link)](https://stackoverflow.com/questions/45170025/cant-use-manifest-placeholders-to-remove-a-permission))

```xml
<uses-permission android:name="${excludeDebugPermissionName}" tools:node="remove" />
```

```groovy
buildTypes {
    release {
        ...
        manifestPlaceholders.excludeDebugPermissionName = "android.permission.SYSTEM_ALERT_WINDOW"
    }
    debug {
        ...
        manifestPlaceholders.excludeDebugPermissionName = "fake.name"
    }
}
```

But there are much more possibilities, e.g. I can think of an app that uses different launcher activities.

Do you have any interesting experiences using the placeholders? Feel free to share with me in the comments :-)
