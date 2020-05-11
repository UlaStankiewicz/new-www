---
layout: post
title: A few things I like about React Native. And a few I don't.
author: azabost
hidden: false
crosspost: true
tags: [React Native, iOS, Android]
comments: true
---

React Native is still a hot topic at the company. After spending some time with it, many of us have some thoughts and I think there is still a lot to say about it so I would like to share some of my observations and feelings.

This post is going to be extremely subjective so please don't treat it as the only truth. Actually, there are as many different opinions on RN as there are people who have worked with it... or even more :)

### Documentation ###

Or maybe I should say: &bdquo;the lack of it&rdquo;? It's not like there is completely no documentation at all. It's just poor, incomplete and therefore not particularly useful from time to time.
A quick example: try to understand the `KeyboardAvoidingView` [behaviors](https://facebook.github.io/react-native/docs/keyboardavoidingview.html#behavior).

### *Gotchas!* ###

Even if you do understand the `KeyboardAvoidingView`, let me add that it works differently on Android and iOS, so after a few hours you either end up with some weird solution (like putting all your views inside another view, which experimentally proven to be helpful, but it still needs some tweaking) or you give up, saying: &bdquo;*let's hope the user will be smart enough to hide the keyboard and find that login button at the bottom of the screen*&rdquo;.

Fun fact: at some point I've found out that the keyboard avoiding behavior works well until I open the next screen, and another, and finally go back to the first one &mdash; then it doesn't. Magic trick!

*(Now I start to think the keyboard avoiding feature deserves it's own blog post...)*

### Community-driven development ###

I am a great fan of open source projects, but RN is a bit disappointing in this aspect, especially considering that it's maintained by Facebook.
Unfortunately, the maintainers can't keep up with a huge number of reported issues and pull requests. They even admit that by posting automated comments like [this](https://github.com/facebook/react-native/issues/5988#issuecomment-185384590):

> React Native, as you've probably heard, is getting really popular and truth is we're getting a bit overwhelmed by the activity surrounding it. There are just too many issues for us to manage properly.

And it's quite understandable, but did you know about it before reading this post? It's easy to get hyped and then regret it.

Another thing I don't like about it is the way the GitHub issues are managed. Many of them are being closed and moved to another issue tracker (but not always). I know it may be easier to manage this number of issues using some better tool than GitHub, but hey &mdash; why do you close them? A few times I have heard something like &bdquo;RN has only 500 open issues on GitHub, it must be quite stable considering it's size&rdquo;. Nope. ([example 1](https://github.com/facebook/react-native/issues/15154#issuecomment-335220801), [example 2](https://github.com/facebook/react-native/issues/9866#issuecomment-260227960))
And often you don't even know if the issue was fixed or not &mdash; it's not mentioned anywhere (neither GitHub nor the [ProductPains](https://react-native.canny.io/feature-requests)).

### Debugging ###

Eliasz has already mentioned some of our debugging experience in [his post](https://brightinventions.pl/blog/react-native-the-things-that-you-shoud-be-aware-of-before-coming-onboard/), but let me put my two cents in.

* The app might be much slower while debugging (in fact, it slows down when you enable the *dev* mode, which is needed for debugging). Before we switched to a different navigation library, navigating from one screen to another was taking up to 2 minutes (!).
* Accessing the In-App Developer Menu on a device is a pain. If you are using an emulator, you can bring the developer menu up with a keyboard shortcut, but on a device you use a shake gesture. Now, just imagine yourself shaking a tablet like tens times a day (or even more). There are no refunds for broken devices.
* I don't know if other debuggers also have this issue, but using a browser-based debugger I experienced stale or incomplete data printed to console. Printing a whole object was giving a different result than printing its properties one by one.

### A common codebase ###

Sharing the code for both Android and iOS is just awesome. No more questions for missing translations, complex algorithms, color themes, fonts etc. What a relief!

### Creating the UIs ###

If I could take just one RN feature to a deserted island of native development, it would be the [layouting](https://facebook.github.io/react-native/docs/flexbox.html). Now, working on a non-RN project again, I must admit I miss it. It's probably the most pleasurable code-XML mixture I have ever seen.

### Storybook ###

[Storybook](https://github.com/storybooks/storybook/tree/master/app/react-native) is a great tool that helps you design and develop UI components without running the app. From Android developer's perspective it's even better than the layout preview mode in Android Studio, because with Storybook you can also easily populate your components with some real data and see how it looks.
At some point I was using two Android emulators and one iOS simulator simultaneously, testing all my code changes in the UI almost immediately thanks to the Storybook.

### Summary ###

I know that after reading this post it might look like there are so many terrible problems with RN that you should stay away of it at all cost, but I don't really mean it. I just like to complain a lot :)

Now you are much better prepared if you decide to give it a try and, believe me, it's worth it. Even if you don't decide to stay with it much longer, the experience you are going to gain is priceless.

I would love to see RN mature to the point where you don't have to struggle with it so much.

*(and I wish it were using Kotlin instead of JS/TS...)*
