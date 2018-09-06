---
layout: post
title: Don't be a mockup developer
author: mateusz
tags: ['android', 'ios', 'programming practices']
comments: true
hidden: true
image: /images/react-native-custom-ios-build-configurations/build-configurations.png
---

Many times as a mobile developer I had to work on apps without the API that was crucial for the feature I was implementing. Either the backend was developed by another team that was not entirely in sync with us or our backend team had no chance to implement those endpoints earlier. For this reason, I was not able to satisfy the Definition of Done ([follow this link to learn more about DoD]) but it does not mean that I have implemented the UI only.

## Ninety-ninety rule

One might think that without the API work on certain features can only be limited to building the UI. The main problem with such approach is that we live in a false belief that we have done everything we could and we mislead the whole team that the feature is "almost ready". When the API is done we realise that there is still plenty of work to do and we need much more time to finish the feature.

[Ninety-ninety rule](https://en.wikipedia.org/wiki/Ninety-ninety_rule) says:
>The first 90 percent of the code accounts for the first 90 percent of the development time. The remaining 10 percent of the code accounts for the other 90 percent of the development time.

There is some truth in this humorous aphorism, if we create a false belief that the application is almost ready, we obscure the project progress.

## What can I do?

Follow these steps before assuming there is nothing else we can do:
- Make any call
  - Even if you cannot use the real endpoint, there are plenty of services that lets you mock the API ([mocky](https://www.mocky.io), [mockable](https://www.mockable.io), [fakejson](https://fakejson.com) and others)
- Handle errors
  - Beyond handling unknown errors, sometimes we expect some specific errors, especially when making synchronous calls (email is taken, password is incorrect, etc.)
- Check the Internet connection before making synchronous call
- Show loader during synchronous call
- Show placeholder if there is no data fetched
- Check if asynchronous call stops when user leaves the screen
  - Make sure there are no memory leaks
- Make sure that you do not modify the UI from the background thread

Additionally, you can:
- Test if the signals have been called (if you use e.g. Rx)
- Test the view state (if the loader was hidden after successful API call, etc.)

If you think about the feature for a long time, other ideas can come to your mind.

## You can do more

If only the API is developed by our backend team we can do even more. Since we know what do we expect to get from the endpoint, and what data we have to provide, we can prepare an example request and response (even including error codes) on our own. Thinking about the API will help us understand the problem better and the backend developer for sure will appreciate our effort.

## Do your best

- korzyści
- do mockupów są duże tańsze i szybsze narzędzia

And if we create only the UI, we are not better than mockup which is faster and cheaper.