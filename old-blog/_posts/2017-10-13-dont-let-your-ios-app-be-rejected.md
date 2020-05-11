---
layout: post
title: Don’t let your iOS app be rejected
author: mateusz
tags: ['ios', 'in-app purchases', 'subscriptions', 'apple', 'review process']
comments: true
---

While implementing in-app purchases, especially **auto-renewable subscriptions**, there is a good chance your app will be rejected during a review process if you don’t follow the guidelines exactly. How can you avoid unnecessary trouble?

![image1](/images/dont-let-your-ios-app-be-rejected/rejected1.png)

## Monetise your app

Phil Schiller announced at WWDC 2017 that Apple so far had paid out **over 70 billion dollars** to the developers of which 21 billion dollars within last year. By 2017, the total global sales from in-app purchases is [projected to amount of 36 billion dollars](https://www.statista.com/statistics/220186/total-global-in-app-revenue-forecast) while the total global sales from paid app download is [projected to amount of 27 billion dollars](https://www.statista.com/statistics/273122/global-paid-for-mobile-app-revenues-forecast). This means that users are more willing to spend money on mobile apps if there is a free version and they can pay for full access later on (freemium model). Mobile revenue is growing every year and in-app purchases are a great way to monetise your app.

## In-app purchases

On iOS we distinguish 4 types of in-app purchases:

- Consumable
- Non-Consumable
- Auto-Renewable Subscriptions
- Non-Renewing Subscriptions

Consumable in-app purchases are used once and can be bought again what makes them an easy solution for in-app gifts or extra game bonuses. Non-consumable purchases are permanent and can be restored even after the app reinstalls, which is usually used for unlocking premium features of the app or disabling the ads. Further, non-renewing subscriptions are valid for a limited time only, which can be applied for example for seasonal passes. It’s like non-consumable which is consumed after a specific period of time.

Probably the most appealing for developers are **auto-renewable subscriptions** which can provide a steady income from the in-app content. They can’t be cancelled inside the app (there is no API for that) which makes it harder for users to stop the subscription. To encourage users to try it out you can offer a free trial lasting from 3 days up to even 1 year. Another advantage of subscription model is an increased revenue after 1 year. After subscriber accumulates one year of paid service, your revenue increases to 85% of the subscription price instead of traditional 70%.

## Abuses

Unfortunately, a lack of API for cancelling the subscription programmatically in combination with a quite unobvious process for resigning manually creates some possibilities for frauds.

Recently, [Johnny Lin has discovered on AppStore](https://medium.com/@johnnylin/how-to-make-80-000-per-month-on-the-apple-app-store-bdb943862e88) many high-ranked scam apps that are prompting a user to pay up to **$100 a week**. One might think that no one would pay that much for such simple services like WEP password generating or VPN service of dubious reputation but according to [Sensor Tower](sensortower.com) some of those applications are earning up to **$300k a month**! After a quick research, Johnny found 10 scam apps that might be earning in total over 7 million dollars a year. It seems that vaguely communicated subscription can be easily accepted by unaware user.

Such cases have probably **made Apple be more demanding** when reviewing auto-renewable subscriptions before publishing the app in the store. Now, when you don't meet any requirement regarding subscriptions, whether within the app or in AppStore description, your binaries will most likely be **rejected**.

![image2](/images/dont-let-your-ios-app-be-rejected/rejected2.jpg)

## Stick to the rules

To make sure you meet the Apple requirements you need to include information about the auto-renewable nature of the subscription in both app's **binary** and **metadata**.

According to Apple, you must include:

>- Title of publication or service    
- Length of subscription (time period and content or services provided during each subscription period)
- Payment will be charged to iTunes Account at confirmation of purchase
- Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period
- Account will be charged for renewal within 24-hours prior to the end of the current period, and identify the cost of the renewal
- Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase
- Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable
- A link to the terms of use

This means, that information about the pricing, exact moment when (and how often) users will be charged and an instruction how they can unsubscribe must be **communicated clearly** in both AppStore app’s description (metadata) and the application UI (binary).

You must be frank about the costs and you need to make sure that users won’t be surprised once charged. The more honest and user-friendly you are, the better.
