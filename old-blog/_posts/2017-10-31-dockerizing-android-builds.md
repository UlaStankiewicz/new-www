---
layout: post
title: Dockerizing Android builds
image: /images/dockerizing-android-builds/container-1574239_1920.jpg
author: azabost
crosspost: true
hidden: false
tags: [android, build, docker]
---

Docker is a great container platform that helps building a true independence between applications, infrastructure and developers. It provides an isolation which supports building modern continuous integration environments with ease and at low cost.

# Building Android applications #

The easiest way to build an Android app is to use Android Studio, but how one can build the application without the IDE or even without a graphical interface (using only the command line)?

## Android command line tools ##

Google provides a separate package of command line tools needed for building an application. The same tools are included with Android Studio, so you may be already familiar with some of them.
The package is available at the [Android Studio downloads page](https://developer.android.com/studio/.html#downloads) under the _Get just the command line tools_ section. Since Docker images are Linux-based, we will use the Linux package, e.g. [sdk-tools-linux-3859397.zip](https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip).

## sdkmanager ##

The `sdkmanager` tool can be used to manage (install, delete, update) all the SDK packages required to build the application.

If you are not sure what packages you should install, but you already have an Android project and you are able to build it using Android Studio, you can deduce it using your local `sdkmanager`.

You can locate it using the Android SDK section in Android Studio preferences. Open the SDK location and navigate to `tools/bin/` subdirectory.

![Docker](/images/dockerizing-android-builds/as_sdk.png){: .center-image}

Now, run `sdkmanager --list` command to see the list of installed and available (to install) packages. Some of them are required to build your project.

_(Note: you may prefer to also add `--verbose` to the `sdkmanager --list` commands which prevents shrinking the long package names)_

You should also visit your `build.gradle` files to find out the SDK dependencies, e.g. compile SDK version, build tools version, libraries etc.

## Accepting licenses ##

Downloading some of the SDK packages may require to accept a separate license(s) first. While Android Studio shows a dialog with accept buttons, the command line `sdkmanager` displays a prompt like this:

```
---------------------------------------
Accept? (y/N):
```

Unfortunately, the tool doesn't provide any parameter to automatically answer "yes", so it might be inconvenient when you try to automate this process. Thankfully, there are some ways to overcome this problem.

### Solution 1: Copy accepted license agreements to the build machine ###

Every time you accept a license (using either Android Studio or command line), a license string is appended to a specific file located in `licenses/` subdirectory of Android SDK. Once accepted, you may install more packages covered by the same license without additional prompts. Moreover, Gradle build can automatically download missing SDK packages as long as the corresponding license agreements have already been accepted.

This gives us an opportunity to get the accepted license files from the developer's computer and copy them to another machine, enabling the builds. This approach was also described in the [Android user guide](https://developer.android.com/studio/intro/update.html#download-with-gradle).

Of course copying files over and over again may be burdensome so instead you can just echo the license strings to the corresponding files automatically somewhere in the build process, e.g.

```
# ANDROID_HOME is the Android SDK location

mkdir "$ANDROID_HOME/licenses"
echo "d56f5187479451eabf01fb78af6dfcb131a6481e" > "$ANDROID_HOME/licenses/android-sdk-license"
echo "8933bad161af4178b1185d1a37fbf41ea5269c55" >> "$ANDROID_HOME/licenses/android-sdk-license"
echo "84831b9409646a918e30573bab4c9c91346d8abd" > "$ANDROID_HOME/licenses/android-sdk-preview-license"
# More licenses if needed
```

But there is a catch with this approach: the license strings may change from time to time with Android SDK updates. When it happens, you must update them on the build machine again.

### Solution 2: Accept all the licenses at once ###

The second way to accept the licenses automatically is to use the `yes` program and combine its output with the `sdkmanager --licenses` command. The latter one displays a series of prompts to accept all available and unaccepted yet licenses and the first one prints "y" continuously.

```
yes | sdkmanager --licenses
```

The main advantage of this approach is that it doesn't require you to maintain a list of license strings for echoing. Nevertheless you must run it again if the license strings get changed with an SDK update. The only drawback is that you don't know _a priori_ what you are going to accept and it may be a bit more troublesome to compare your local licenses with the ones on the build machine without a direct access to it.

![Docker](/images/dockerizing-android-builds/container-1574239_1920.jpg){: .center-image}

# Wrapping it in a Docker container #

In order to build an Android application inside a Docker container, you need an image that includes Java Development Kit (JDK) and Android SDK. While the process of getting the latter one was described above, you are yet to decide how to get the JDK.

## Setting up a Dockerfile ##

The easiest way is to use the `openjdk` ([link](https://hub.docker.com/_/openjdk/)) as the basis for your image as it already has the JDK installed (as well as other useful tools). So the first line of your `Dockerfile` could be:

```
FROM openjdk:8
```

On the other hand, you can just get any image with `apt-get` e.g. `debian` ([link](https://hub.docker.com/_/debian/)) and install the JDK by yourself. You will also need some tools to download and unzip the Android SDK (in this example I use `wget` and `unzip`) so you can install all these packages at once.

_(Remember to follow the [Dockerfile best practices](https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/))_

```
FROM debian
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk wget unzip && \
    rm -rf /var/lib/apt/lists/*
```

Now you can proceed to fetching the Android SDK. You should also set the `ANDROID_HOME` variable so that the application builds would know the SDK location. Using `wget` and `unzip` it may look like this:

```
ENV ANDROID_HOME /opt/android-sdk-linux

RUN mkdir -p ${ANDROID_HOME} && \
    cd ${ANDROID_HOME} && \
    wget -q https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip -O android_tools.zip && \
    unzip android_tools.zip && \
    rm android_tools.zip
```

It's also useful to add some SDK tools to the `PATH`:

```
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools
```

The last step is to accept the Android SDK licenses using one of the mentioned ways, e.g.:

```
RUN yes | sdkmanager --licenses
```

## Building the image ##

Having the `Dockerfile` part completed it's time to build the image with `docker build` command. Please read some [docs](https://docs.docker.com/engine/reference/builder/#usage) first as it's easy to miss some important details like a possibility to accidentally tarball and transfer your whole disk to the Docker daemon ;)

> Warning: Do not use your root directory, /, as the PATH as it causes the build to transfer the entire contents of your hard drive to the Docker daemon.

Let's say we build the image like this:

```
docker build -t my-sdk-image .
```

## Running the build ##

Now we can run a new container based on the built image. The container will need an access to your Android project sources and the simplest way is to mount the sources directory using the `-v` flag.

Please also keep in mind that you probably have the `local.properties` file in your project directory which specifies the SDK location (overriding the `ANDROID_HOME` environment variable). I usually add this file to the `.gitignore` so in the continuous integration environment this file does not exist as it is not included in the repository. When you are testing the Dockerized builds locally, you can just remove or temporarily rename that file.

Here is an exemplary command to run the build in a container:

```
docker run -v $(pwd):/home/app \ # mount current directory
           --rm \                # remove the container when it exists
           my-sdk-image \        # image name
           /bin/bash -c "cd /home/app && ./gradlew clean assembleDebug"
```

If you use some environment variables during the build (e.g. to specify a build version), you can pass them from the host machine to the container using `-e` flags.

When the build is finished, the build outputs are already available on your host machine thanks to the `-v` mounting.

# Considerations #

While the image is sufficient to build a regular application, you might want to further customize it for several reasons.

## Pre-fetching SDK packages ##

First of all, I haven't specified any SDK packages to be downloaded using the `sdkmanager` in the `Dockerfile`. This means your Gradle build will need to download the missing packages every time you run it in the container, possibly causing severe network usage and additional time consumption. Thus you should consider preparing a `Dockerfile` which builds an image with pre-downloaded packages, but you should be careful with it as the resulting image's size will be significantly larger.

For example, adding the following lines to the `Dockerfile` will make the image about 1 GB larger.
```
RUN sdkmanager 'platform-tools'
RUN sdkmanager 'platforms;android-26'
RUN sdkmanager 'build-tools;26.0.2'
RUN sdkmanager 'extras;m2repository;com;android;support;constraint;constraint-layout-solver;1.0.2'
RUN sdkmanager 'extras;m2repository;com;android;support;constraint;constraint-layout;1.0.2'
RUN sdkmanager 'extras;google;m2repository'
RUN sdkmanager 'extras;android;m2repository'
RUN sdkmanager 'extras;google;google_play_services'
```

## NDK ##

As I don't use the [NDK](https://developer.android.com/ndk/.html) in my applications at the moment, I can't be 100% sure about all the requirements (please let me know if you have some more experience), but during a simple test with an empty NDK-enabled project I have already found some gotchas:

* NDK bundle must be installed manually with `sdkmanager ndk-bundle` (Gradle didn't install it automatically for me).
* When you are testing the Dockerized build locally, leaving the `app/.externalNativeBuild` directory from previous builds will make the build command fail due to wrong NDK location path (e.g. in the generated `ninja` and `CMakeCache` files).

# Docker Hub #

It's even easier to build Android applications by getting the images directly from [Docker Hub](https://hub.docker.com/).

I've just published [my images (link)](https://hub.docker.com/u/azabost/) there so if you don't need any customizations, you can run a container without your own `Dockerfile` like this:

```
docker run azabost/android-sdk
```

You can also use my images as a base for your image by specifying one of them in your `Dockerfile`:

```
FROM azabost/android-sdk
```
