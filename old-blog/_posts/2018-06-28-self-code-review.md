---
layout: post
title: Self code review
image: /images/self-code-review/image.jpg
author: agnieszka
hidden: false
tags: code review
---

Once I was a child my parents were convincing me that it was  worth double checking both my homework as well as tests before handing them in, to catch errors and fix them. It soon became a habit for me. The habit that once evaluated into a self code review process :)

![](/images/self-code-review/image.jpg){: .center-image}

I will share with you the steps I take before commiting code. Probably most of them are obvious to you, but maybe you will find something interesting and worth including into your routine?

**1. Compilation errors**

This might seem to be quite obvious. If the code doesn’t compile, how can you even check if it works? I have added this step to my in-mind checklist lately as in our TypeScript projects the `compile` script is a little more “strict” than the one for running an app in the hot reloading mode (e.g. compilation errors on unused imports). So even though the app recompiles seamlessly, it will not compile on the CI server. 

**2. Warnings**

I actually quite like a strict approach when warnings prevent compilation. But this is not always the case, so it’s worth  having in mind to look through the warnings and apply fixes where needed.

**3. Unit and integration tests**

Just run all tests and see if they are green. This is also the time for some framework-specific checks, e.g. `mocha` requires to append `only()` to test methods to run a specific subset of the tests. Of course you need to remove it before commiting :) Do you know any other frameworks’ features which are likely to produce this kind of leftovers?

**4. The code review itself**

I usually list all the files that have changed and then read them carefully one by one, paying special attention to the following elements (the similarity to an ordinary code review process is not accidental :) ).

* All the little things that make the code cleaner like all the shorthands or smart methods that modern languages have (to name a few: Kotlin’s `isNullOrEmpty` or Scala's `getOrElse`). IDEs give lots of such hints, we just need to make use of them.
* Spelling - typos make the code messy :)
* Rethink the names of classes, variables and so on. Are they meaningful enough? Or maybe too verbose?
* Any too complicated constructions like long computations or nested conditions? If I have just written it and still do not get the sense at first glance, maybe there is a way to make it cleaner?

IDEs make this kind of reading easier. In the code editing window you have the changed lines marked so you know which ones to focus on at most. I know some of us use the diff window for this purpose. I usually prefer the more gentle way of highlighting the differences, but that’s quite personal - try both and decide which is the best for you. Or just combine them.

**5. The big picture**

Then I read the code again, taking the big picture this time. The aim is to check if the code is clear and understandable, if it just reads smoothly.

**6. CI server check** 

Once I have committed and pushed, the last step is to check if the code compiles and the tests are green on the CI server.


Do I apply this routine each and every time? Does this routine prevent me from checking some fishy code in? Of course not, we all know scenarios of delivering a feature as soon as possible or just a little change which surely does not require all these steps. Commits like `Fix typos` or `Remove “only” from tests` still happen :) But after all, we are only humans and we all make mistakes. And the teammate code review is just irreplaceable :)
