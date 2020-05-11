---
layout: post
title: Don't be a mockup developer
author: mateusz
tags: ['android', 'ios', 'programming practices']
comments: true
image: /images/dont-be-mockup-developer/workspace.jpg
---

Many times as a mobile developer I have to work on apps without the API ready that was crucial for the feature I was implementing. Either the backend was developed by another team that was not entirely in sync with us or our backend team had no chance to implement those endpoints earlier. For this reason, I was not able to satisfy the [Definition of Done](https://brightinventions.pl/blog/definition-of-done) but it does not mean that I have implemented the UI only.

![Workspace image](/images/dont-be-mockup-developer/workspace.jpg)

## Ninety-ninety rule

One might think that without the API our work on certain features can only be limited to building the UI. The main problem with such an approach is that we live in a false belief that we have done everything we could and we mislead the whole team that the feature is "almost ready". When the API is done and we start an integration in the app we suddenly realise that there is still plenty of work to do and we need much more time to finish the feature.

[Ninety-ninety rule](https://en.wikipedia.org/wiki/Ninety-ninety_rule) says:
>The first 90 percent of the code accounts for the first 90 percent of the development time. The remaining 10 percent of the code accounts for the other 90 percent of the development time.

There is a lot of truth in this humorous aphorism. If we create a false belief that the application is "almost ready", we obscure the project progress.

## What can I do?

Follow these steps before assuming there is nothing else you can do:
- Make any call
  - Even if you cannot use the real endpoint, there are plenty of services that let you mock the API ([mocky](https://www.mocky.io), [mockable](https://www.mockable.io), [fakejson](https://fakejson.com) and others)
  - Making a call instead of showing an alert or using some predefined data will draw your attention to completely new problems
- Handle errors
  - Beyond general errors, sometimes we expect some specific errors, especially while making synchronous calls (email is taken, password is incorrect, etc.)
- Check the Internet connection before making the synchronous call
- Show a loader during the synchronous call
- Show a placeholder if there is no data fetched
- Check if the asynchronous call stops when user leaves the screen
  - Make sure there are no memory leaks
- Make sure that you do not modify the UI from the background thread

Additionally, you can:
- Test if the signals have been called (if you use e.g. Rx)
- Test the view state (if the loader was hidden after a successful API call, etc.)

The more you think about the feature, the more ideas will come to your mind.

## Support the backend

The work we can do does not have to be limited to the code only. Since we know what we expect to get from the endpoint, and what data we have to provide, we can prepare an example request and response structures on our own. We can also prepare a list of suggested error codes that we can already handle in the app. Prototyping the API will help us understand the problem better and the backend developer for sure will appreciate our effort.

![Shaking hands image](/images/dont-be-mockup-developer/support.jpg)

## Do your best

Being a good programmer is not just about writing code. We solve real-life problems which make us responsible for the work we do. Implementing a feature which is a simple click dummy is only postponing the effort that has to be made anyway and misleads the stakeholders about the project progress.

And remember, if we create the UI only, we are not better than mockup tools, but these are faster and cheaper.
