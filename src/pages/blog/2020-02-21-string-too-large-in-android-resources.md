---
crosspost: true
layout: post
title: Watch out for large strings crashing your Android app
date: 2020-02-21T00:00:00.000Z
image: /images/andrzej_watchout-copy.png
author: azabost
tags:
  - android
  - large
  - string
  - aapt
  - apk
  - crash
hidden: false
comments: true
published: true
---
I've recently come across a weird and totally unexpected issue while developing an Android app. I bet a lot of people may have enough luck to never notice it but if it finally happens to you and crashes your app, it's quite hard to pinpoint the cause of the issue quickly if you don't know what you are actually looking for.

## STRING_TOO_LARGE... what?

It seems quite probable that you are not going to know about this problem in your project until you see or experience it yourself so let's start with its symptoms.

First and foremost, you may see a crash with a stacktrace looking more or less like this:

```java
    android.content.res.Resources$NotFoundException: Drawable com.azabost.stringtoolarge:drawable/ic_my_icon with resource ID #0x7f060057
    Caused by: android.content.res.Resources$NotFoundException: File res/drawable-anydpi-v24/ic_my_icon.xml from drawable resource ID #0x7f060057
        at android.content.res.ResourcesImpl.loadDrawableForCookie(ResourcesImpl.java:847)
        (...)
     Caused by: java.lang.IllegalArgumentException: R is not a valid verb. Failure occurred at position 2 of path: STRING_TOO_LARGE
        at android.util.PathParser.nCreatePathDataFromString(Native Method)
        at android.util.PathParser.access$200(PathParser.java:24)
        at android.util.PathParser$PathData.<init>(PathParser.java:76)
```

A little less noticable issue is when you try to display a text in the UI and the result of doing so looks like this:

![String too large in TextView](/images/string-too-large/string_too_large_text.png)

As you can see, in both cases there is that strange `STRING_TOO_LARGE` either displayed directly in the UI or mentioned in the stacktrace.

Would you guess how that happened?

## Reproduction

The STRING_TOO_LARGE issue is pretty easy to reproduce and may happen to you quite unexpectedly. The easiest way is to add a string resource to your app that is longer than 0x7FFF = 32767 characters and then displaying it e.g. in a TextView. That's it! Simple, right?

*I recommend generating such a long string using some kind of [lorem ipsum generator](https://www.lipsum.com/) rather than writing it yourself 8-)*

But if you want to crash your app in a way I have mentioned above, it will be a little more complex. You still have to add a string that large but this time try to put it into the [vector drawable](2017-10-19-creating-simple-vector-drawables-in-android-studio.md) `android:pathData` attribute.

*Having vector drawables with very long paths is not recommended and Android Studio or lint should warn you about it, but there is no warning when you exceed the above mentioned limit in a string resource.*     

## How does it happen?

The issue is caused by the AAPT/AAPT2 (Android Asset Packaging Tool) which processes your app's resources and replaces them with the `STRING_TOO_LARGE` value when it finds a large string.

If you take a look into the APK file affected by this issue, you will find something like this:

![Changed string resource](/images/string-too-large/string_res.png)

Or, in case of the vector drawable, something like this:

![Changed drawable resource](/images/string-too-large/drawable_res.png)

which is not a valid vector path, obviously :-D

If you are interested in the details, here you can find the AAPT2 source code fragment which converts the large strings: [StringPool.cpp](https://android.googlesource.com/platform/frameworks/base.git/+/master/tools/aapt2/StringPool.cpp#344)

## Detect the issue before you release it

The simplest way to find out if your app is affected is to read the build log carefully looking for the following message:

```bash
error: string too large to encode using UTF-8 written instead as 'STRING_TOO_LARGE'.
```

Surprisingly, the build process does not fail when it happens.

If you use a build system like Jenkins, TeamCity or QuickBuild, you should be able to configure the build to fail when such a log message is detected. In case of TeamCity, it's about adding a failure condition like below.

![Failure condition](/images/string-too-large/failure_condition.png)
