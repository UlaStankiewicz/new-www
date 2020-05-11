---
layout: post
title: The modern way of getting started with React and TypeScript
excerpt: One of the prerequisites for a healthy and sustainable tech stack that reduces the risk of our project quickly getting obsolete is a tooling and automation around the mundane chores. Out of the tools fatigue JavaScript world suffered few months back the new generation solution was born at Facebook for React.
tags: [React, TypeScript, web]
comments: true
author: adam
hidden: false
image: /images/react-ts/cra-ts.png
---

One of the prerequisites for a healthy and sustainable tech stack that reduces the risk of our project quickly getting obsolete is a tooling and automation around the mundane chores. Few months back the JavaScript world suffered from the tools fatigue when the brand new solutions to the build and configuration automation problem popped up daily, each with its own learning curve.

But out of this failed attempts the new generation solution was born at Facebook for React. [`create-react-app`](https://github.com/facebook/create-react-app) (often shortened to CRA) is an all-in-one integrated development tool, preconfigured with webpack for bundling and packaging, Babel for ES6 support, powerful dev server with all the modern conveniences, a test runner with coverage tool, etc. There is even a Service Worker ready to [kickstart your PWA journey](https://www.linkedin.com/pulse/10-reasons-why-you-should-consider-progressive-web-apps-eriksen/). 

All is wrapped together in a single updatable NPM dependency. It abstracts away everything but the actual application code from the developers that don't need to dig deeper – no build process is visible, no dev tools configuration is required, no tests wiring is necessary, no boilerplate needs to be generated before we can actually start writing our app code. CRA is THE way for the most small-to-medium React projects to avoid the whole build configuration hassle.

```
npx create-react-app my-app
cd my-app
npm start
```

This is all we need to get started and see the "Hello World" page served from the local development server, auto-refreshing whenever a source code change happens.

![Hello World from create-react-app](/images/react-ts/cra.png)

This is cool and already saved us a week of headaches. But there is no TypeScript support available by default in create-react-app. TypeScript is really great and after working together for some time now I feel that JavaScript without TypeScript is like a cake without chocolate - you might eat it, but where's that pleasure?

Fortunately, I'm not the only one who thinks this way and Open Source does not like void. There is a fork of create-react-app that replaces Babel with TypeScript, surprisingly named [`create-react-app-typescript`](https://github.com/wmonk/create-react-app-typescript). Let's rewind and start from scratch, with TypeScript this time:

```
npx create-react-app my-app --scripts-version=react-scripts-ts
cd my-app
npm start
```

Note something important – we are not invoking `create-react-app-typescript` fork's own binary. CRA is designed in such a way that it is open for customizations without the hassle of being bound to a fork that might stop being maintained. We're actually still using `create-react-app` directly, we just replaced the piece of its inner machinery (`react-scripts`) with the one that is TypeScript aware (`react-scripts-ts`). It means that whenever there's an update available within `create-react-app` for our development, bundling or testing environment, we are – as the first class citizens – still able to just `npm update` and get all the goodies.

And here is what we get – almost the same thing as before, but with TSX (TypeScript-flavoured JSX) instead! 

![Hello World from create-react-app-typescript](/images/react-ts/cra-ts.png)

But what if we outgrow the offerings of `create-react-app` and we need to dig down into the webpack bundler or jest test runner's shenanigans? It is possible, but unfortunately, in this case we need to say goodbye to the nice and clean abstraction that shielded us from dealing with ~30 direct dependencies and ~12 configuration files. When we run `npm run eject` command, our project gets rewritten to include all of this directly and we can no longer `npm update` our development environment as a single dependency. We should definitely know what we are doing before we decide to do so. And in most cases, until we start having non-standard requirements for the build process, we should not need to do it.

In the [next post](https://brightinventions.pl/blog/5-ways-to-benefit-from-typescript-in-react/) we'll see how we can benefit from having TypeScript support in our React app.
