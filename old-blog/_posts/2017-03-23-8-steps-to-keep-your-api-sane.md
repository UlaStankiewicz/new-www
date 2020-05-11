---
layout: post
title: 8 steps to keep your API sane
excerpt: It is pretty well known what a backward compatibility means for our APIs - once something was deployed to production and used by the users, we may not change its behavior or break its contracts. It’s far less obvious what a forward compatibility is, even though it is equally important for our APIs longevity and maintainability.
tags: [api, design]
comments: true
author: adam
---

For the last 5 years Bright Inventions has been providing [full stack services](http://brightinventions.pl/services/) to our customers. We have [taken part](http://brightinventions.pl/projects/) in a dozen of smaller or bigger projects where we were responsible for both the mobile apps and the backend as well as we were involved in a long-term maintenance and development. This way we have already had a few opportunities to learn how hard it is to **continuously serve the existing users** of our customers' apps and **go forward with the development** at the same time. And we have learned that even when the backend and mobile developers sit together in one room, designing a good and future-proof [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) communication layer between the two (API) is not an easy task to do.

It is pretty well known what a **[backward compatibility](https://www.garfieldtech.com/blog/backward-compatibility)** means for our APIs - once something was deployed to production and used by the users, we may not change its behavior or break its contracts - otherwise our apps will crash or not serve its purpose well, at best. 

It's far less obvious what a **forward compatibility** is, even though it is equally important for our APIs longevity and maintainability. How can we possibly be compatible with something we'll have in the future, when we don't know that future yet? Well, we can't, but there is a set of rules and practices that we should follow to reduce the risks of inadvertently introducing breaking changes or getting to the point where it's not possible to introduce new features in a sane way without breaking the old ones. 

![photo](/images/woman-hand-smartphone-desk.jpg)

1\. Version the API and identify clients from day 1
====

Apps are often born as quick & dirty prototypes just to get to the market quickly and validate the business perspectives. But these prototypes are rarely thrown away before the "real" app is conceived - more often they evolve into these "real" apps. This means the users of the first prototype become the first users of the real app - and its API. That's why we should include basic properties of the "real" APIs even when we're building these prototypes. 

We should expose our endpoints with proper versioning (regardless of [which strategy of versioning](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/) we are backing), so that we don't need to reorganize both our backend routing code - keeping unversioned endpoints next to the new versioned ones - and apps' API clients code once we approach v2. We should also ensure that our apps (clients of our API) properly identify themselves, sending several differentiating properties as headers within our API requests:
* client platform (iOS vs. Android etc.),
* client version/build number,
* client locale settings or any other device-specific info we might rely on.

We don't even need to store or read these values in the beginning (although it might make sense to log it), so there's no significant development cost behind it. But in case our implementations on different platforms diverge or a specific build our end customers use is broken and we can only reasonably patch it server-side, we have the ways to differentiate what kind of client we're serving in the given request. Without these headers, all we can do is to fix the problem in the app, release it and beg users to update quickly.

2\. Be liberal in what the app accepts
====

Even if our API contract is well defined and carefully discussed, we can't define the unknown future features. Implementing the contract client-side in a liberal fashion will let us extend the API server-side with some degree of flexibility. Make sure the apps are not literally expecting the objects returned from the backend to have all the fields set - apply some defaults always where it's reasonable to do so. Be prepared for `null`s or empty string values. Don't bail when the backend returns additional unexpected properties - just ignore it. 

Apply the same rules when parsing values that intend to conform to an enumerated set of values - expect unexpected and ignore it. Do not bind your API response enumerated property to the client-side Java or Swift enum using the strict parsing directly. Ignore the unknown value by applying the reasonable default value or by dropping the whole object from processing. By failing to do this we're setting our app to crash when the unknown future enum value will be encountered and effectively forcing us to increment the API version whenever the enum value is added. 

And this leads us directly to the next point.

3\. Avoid bumping up the API version
====

We use API versioning to be able to move forward and introduce breaking changes, leaving APIs used by already existing clients not touched. But if we go for it rigorously, we may treat each and every addition to the API as a breaking change and increment the version number up with every public release of any of our clients. While it might sound reasonable at first, it means we'll end up with dozens of API versions used simultaneously in the wild. Regardless if we use some isolation techniques and deploy each API version separately or just differentiate it in the single codebase somehow, we are going to have headaches maintaining that many versions at once.

If we instead allow for adding new stuff to the existing API version incrementally, without bumping up the version number, we might reduce the number of versions to maintain to a few. Our rule of thumb is: bump up the version number only if the behavior of the existing clients will be affected by the changes introduced. So adding new endpoint without incrementing the number is fine, same with adding new fields to the response or new optional parameters to the request. Existing clients that do not understand it will just not use it. Obviously, this strategy requires testing the existing clients with the new API versions. But it should be done anyway, right?

4\. Don't return plain primitive values
====

Another good practice while designing the API response for future extensibility is not to return standalone primitive values like numbers or strings directly. By doing so we're closing the possibility to add another property to the response object without releasing the new API version - if our clients don't expect an object, the backend can't return one. So even if the request is to get just - let's say - an access token, let's return it as 

```json
{
  "accessToken": "d34d-b33f"
}
```

instead of `d34d-b33f` string directly.

5\. Don't replace objects when updating
====

In the "standard" RESTful approach to APIs (if we [dare to say there is one](http://stackoverflow.com/questions/671118/what-exactly-is-restful-programming)), objects (resources) are to be updated with `PUT` requests that consist of the whole object to be - well... - put at the specified address, replacing whatever was there before. Now, if we follow the previous rules, our object that we got from the backend might already contain fields that our app failed to understand. And if we construct the `PUT` request based on our object-oriented client-side data model, we'll omit these unknowns, effectively inadvertently asking the server to remove it.

We have two ways to avoid this problem. Either we need to have our client-side code ready for these unknown properties, store it in a data model and include it when constructing the `PUT` request, or - what is probably far more reasonable - to avoid `PUT` requests at all and settle on `PATCH` instead. Although `PATCH` definition is a bit vague, we are probably [not](https://www.drupal.org/docs/8/core/modules/rest/4-patch-for-updating-content-entities) [the](http://stackoverflow.com/questions/28459418/rest-api-put-vs-patch-with-real-life-examples) [only](https://blogs.sap.com/2013/01/30/simplify-change-operations-using-patch/) [ones](http://stackoverflow.com/questions/19414979/how-do-you-indicate-request-the-deletion-of-an-object-property-in-a-rest-patch) who use it as an update mechanism that updates only those fields of the object (resource) that were explicitly defined in the request. Setting the value of the property to `null` nullifies it on the server, but omitting the value from the request leaves it untouched on the server. This way we have no way to break the properties we're not aware of.

6\. Don't mess with IDs
====

ID is a property of the data model that although is effectively publicly visible, is for internal use in its nature. It means that the only acceptable use for object's ID client-side is to store it or pass it around without looking into it. Clients should keep IDs opaque, never try to assume anything out if its value or structure. Failing to do so might prevent the backend from changing things that were intended to be a private implementation detail, like storage/database technology etc.

I had once worked with the API in which the ID of the object was composed of a serialized JSON structure that additionally encoded the type of the object. In a large team that encoded type turned out to be too easily visible and very tempting to deserialize and use. Oh, what a mess it was to sort out all the unexpected client-side failures when these internal types were changed on the server...

7\. Prepare for phase out
====

The time comes for every old API to become a roadblock for the progress. Sometimes our app pivots or the original concepts evolve too far so that it becomes unreasonable to keep the support for the oldest API versions and we decide to cut it off. But what if there are still some users that haven't updated? They might be even less willing to update if our app blows up completely one day without notice.

What we might do at the very beginning of the API lifecycle is to define a way to inform the clients that the API version they are trying to use is no longer acceptable. Handle it by gracefully blocking the app, informing the users that it is no longer possible to postpone the update, ideally still letting them access their data. Make the version sanity check a separate HTTP call or a predefined HTTP status code or header value - it doesn't matter. The key is to make sure the apps implement that kind of flow from the earliest version deployed, so that it is possible to phase it out in the future.

8\. Automate!
====

Last but not least. The code evolves both on the server-side and client-side. With several clients, each in several versions, we have a plenty of combinations to maintain and ensure it run in a good state. It is hard for humans, but some parts of it might be much easier for machines. There are tools that might make managing that set of dependencies and interactions easier. Using [Swagger UI](http://swagger.io/swagger-ui/), for example, might help a lot - it can generate the API documentation with testable and runnable examples that are always accurately representing the real implementation and never get outdated. Its sister project, [Swagger Codegen](http://swagger.io/swagger-codegen/) can generate a boilerplate parts of API implementation if we start designing our contract with documentation-first approach. Its toolchain can also [serve as a test platform](http://swagger.io/using-swagger-to-detect-breaking-api-changes/) to programatically detect unplanned breaking changes. Try it!
