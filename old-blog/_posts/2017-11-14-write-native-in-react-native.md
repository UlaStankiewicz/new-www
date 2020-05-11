---
layout: post
title: Putting native in React Native on Android
author: radek
comments: true
tags: ['android', 'react native', 'java', 'platform specific']
image: /images/putting-native-in-rn/toymodel.JPG
---

Using custom native components in React Native is a common thing, so sooner or later you may have to write some functionality in a native language and use it in your application. Let me show you a simple example how to do that.

![toy model](/images/putting-native-in-rn/toymodel.JPG)

### First prepare code in a separate application
We start with creating a simple native application. In this example, our app will show the user information when the headset is plugged in or out. It involves several native interactions:
* app lifecycle interaction while registering or unregistering listeners
* sending and receiving data via intents
* showing information by toasts
* using application context

Assuming you are familiar with creating native Android applications, the example below will be very easy. Our app uses one activity with a simple layout, that later is going to be irrelevant. Start with the private fields that will be used with our activity:

~~~~java
private Context mContext;

private final BroadcastReceiver mHeadsetPlugReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_HEADSET_PLUG)) {
            boolean plugged = (intent.getIntExtra("state", 0) == 1);
            String message = plugged ? "Headset plugged in" : "Headset plugged out";
            Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
        }
    }
};
~~~~

Remembering a reference to your application context is not always necessary, as long as we can call `getApplicationContext` method within our Activity. Let's keep it now because we will modify it later.   
`BroadcastReceiver` is an abstract class and describes behavior on receiving information via Intent.

Registering listener looks like this:

```java
private void registerBroadcastReceiver() {
    IntentFilter filter = new IntentFilter();
    filter.addAction(Intent.ACTION_HEADSET_PLUG);
    registerReceiver(mHeadsetPlugReceiver, filter);
}
```

`registerReceiver` method is an Activity's method and may be invoked on Context class object.

In `onCreate` method save the reference to the application context and register broadcast receiver:

```java
mContext = this;
registerBroadcastReceiver();
```

In the end, following clean coding principles, unregister receiver when closing your application using Activity's `unregisterReceiver` method:

```java
@Override
protected void onDestroy() {
    unregisterReceiver(mHeadsetPlugReceiver);
    super.onDestroy();
}
```

That's it, that is what we're going to work on. The app shows a simple message while plugging the headset in:

![native app](/images/putting-native-in-rn/screenshot1.png)

Let's use it in our RN project!


### /react-project/android
In your React project directory, there is an `android` folder. Its structure looks like every Android project and you may open it with Android Studio for convenient navigation. Source files are under `/app/src/main/java/{some}/{packages}/` and here we will add our code. We will have to pack our functionality in a specific way. Check `MainApplication.java` file first. It's extending `Application` class and implements `ReactApplication` interface. Take a look at `getPackages` method:

```java
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
      new MainReactPackage()
  );
}
```

An application written in React Native is built like any other Android application, but React Native packages are added at runtime and it is specified here. You may write any native code and link it here, but you have to add it as `ReactPackage` and initialize it in `getPackages` method. Will need two files: _package_ and _module_.

First create a package file that implements `com.facebook.react.ReactPackage` interface. It's got two methods and its basic implementation looks like this:

```java
public class MyHeadsetLibPackager implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new MyHeadsetLibModule(reactContext));

        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}

```

The most important part is to initialize module in `createNativeModules` method:

```java
modules.add(new MyHeadsetLibModule(reactContext));
```

`MyHeadsetLibModule` is how we name our second class. It will contain all functionalities of our library. It is necessary to extend `com.facebook.react.bridge.ReactContextBaseJavaModule` class for that.


```java

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class MyHeadsetLibModule extends ReactContextBaseJavaModule {

    public MyHeadsetLibModule(ReactApplicationContext reactContext) {

        super(reactContext);

        /*
            Our starting point.
        */

    }
}

```

Last thing necessary to compile a project is to add dependency to `/app/build.gradle`

```
dependencies {
    ...
    compile "com.facebook.react:react-native:+"
    ...
}

```


### Moving from activity
Now we can implement everything as we did in our activity. Just mind two consequences of moving from `Activity` to `ReactContextBaseJavaModule`.

First:   
**Who's got the context?**   
From now we cannot call activity's methods like `registerReceiver` just like that. We also cannot access the application's context by calling `getApplicationContext`. That's why, in the module's constructor we get `ReactContext` instance. All activity's methods will be called from it.

Second:   
**Where are the lifecycle methods?**   
Right now nowhere. But just implement `LifecycleEventListener` in your module class. It's an interface that provides three basic lifecycle methods:
* `void onHostResume()`   
* `void onHostPause()`   
* `void onHostDestroy()`   

All lifecycle functionalities implement here. Then in the constructor register listener with `reactContext.addLifecycleEventListener(this)` and... done. Our module behaves like activity now.

The last thing to make our module visible is to override `getName` method. It should be returning the name of our module, like that:


```java
@Override
public String getName() {
    return "MyHeadsetLibModule";
}
```

Following all these guidelines a final form of our module rewritten from activity looks like this:

```java

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.widget.Toast;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class MyHeadsetLibModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private ReactApplicationContext mContext;

    private final BroadcastReceiver mHeadsetPlugReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals(Intent.ACTION_HEADSET_PLUG)) {
                boolean plugged = (intent.getIntExtra("state", 0) == 1);
                String message = plugged ? "Headset plugged in" : "Headset plugged out";
                Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
            }
        }
    };

    public MyHeadsetLibModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        registerBroadcastReceiver();
    }

    private void registerBroadcastReceiver() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_HEADSET_PLUG);
        mContext.registerReceiver(mHeadsetPlugReceiver, filter);
    }

    @Override
    public String getName() {
        return "MyHeadsetLibModule";
    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        mContext.unregisterReceiver(mHeadsetPlugReceiver);
    }    
}


```


### Exposing methods to JS
What if we would like to register `BroadcastReceiver` not on the application start, but later, and invoke it from React Native module in TypeScript? Here comes `@ReactMehod` annotation. Just add a method with it to your module class:

```java
@ReactMethod
public void startTrackingAudioJackPlug() {
    registerBroadcastReceiver();
}
```

Now in any TypeScript file, we can import it from `react-native`:

```js
import { NativeModules } from 'react-native'
```

and use calling it directly from NativeModules object:

```js
NativeModules.MyHeadsetLibModule.startTrackingAudioJackPlug()
```


### Getting callback from native module
Last modification - let the message about plugging headset will be displayed not by native toast, but some React Native alert. To do so we have to emit information about plugging headset from native module to JS module. In native code add this:

```java
reactContext
    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    .emit(eventName, params);
```

1. `eventName` is `String` object and identifies emitted message   
2. `params` is `WritableMap` object and contains parameters in simple key-value collection

Now just register listener in JS module to receive the emitted message. Import `DeviceEventEmitter` from `'react-native'` and add this code in `componentDidMount` method:

```js
DeviceEventEmitter.addListener('CustomNameOfTheEvent', function(e: Event) {

    /*
        Here you can display an alert.
        Get parameters values from event like this:
        let parameter = e["key"]
    */

})
```

That's it. We have just implemented a native functionality with bidirectional communication.
