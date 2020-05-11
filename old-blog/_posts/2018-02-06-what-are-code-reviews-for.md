---
layout: post
title: What are Code Reviews for?
excerpt: It is often said that Code Reviews are by far the most effective way to identify bugs in software. However, it is easy to notice that the "code review" term is a bit overloaded and it might mean different things to different people.
tags: [code-review]
comments: true
author: adam
image: /images/people-office-group-team.jpg
---

It is [often said](https://blog.codinghorror.com/code-reviews-just-do-it/) that Code Reviews are by far the most effective way to identify bugs in software. However, it is easy to notice that the "code review" term is a bit overloaded and it might mean different things to different people. At [Bright Inventions](https://brightinventions.pl) we are still learning how to take the most out of this practice (like everyone in our industry, right?) and we have already gone through a few stages of our approach to code review. Let me share a few thoughts about it. 

## Is Code Review about semicolons?

The simplest association one may have with Code Review is that it is all about the consistent code style – to ensure the code is formatted well, all spaces are replaced with tabs or all tabs are replaced with spaces, there are semicolons everywhere or there are no semicolons anywhere, etc. While this is the simplest kind of thing that reviewers might look at, these things are too easy to waste our time on it and it should be handled by automated tools like shared IDE formatting settings ([available for example in JetBrains IDEs](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html)) or static code analyzers like [ESLint](https://eslint.org/) or [TSLint](https://palantir.github.io/tslint/) plugged into our Continuous Integration environment.

There are obviously cases that automated tools are unable to identify so we should look for these within Code Reviews, but having a unified and consistent code style is definitely not the only way we can benefit from doing Code Reviews. We should definitely look deeper.

![What are Code Reviews for?](/images/people-office-group-team.jpg)

Code Review is an ideal chance to:

* share language- or platform-level idioms & practices – each technology comes with its own biases and conditions it works best within; let's ensure we're using our tools correctly, fully benefit from its features and avoid its traps,
* share general programming patterns – there is a plethora of design patterns, it's hard to know all of them and none of them is a universal silver bullet, so it might be worth looking for these that should be used but are not and vice versa,
* ensure readability and maintainability – if the reviewer can't read the code as prose then there's a room for improvement,
* discuss naming and abstractions – let's ensure the team agrees on what are these things we have in our codebase and that they actually and correctly represent the ideas and concepts from the domain world,
* consider the impact of the proposed changes for backward compatibility, performance, accessibility, stability, resource consumption and dozens of other aspects of running software.

## It's also about longevity

All of these aspects are contributing to the overall project quality and it's obvious that the projects that present generally higher quality are easier (and cheaper) to maintain. But there is more. 

One of the problem we tend to struggle is about the [code ownership](https://martinfowler.com/bliki/CodeOwnership.html). When each team member works on the clearly isolated tasks, there is a very little intersection between code written by different people and some code ownership silos are created. It means that it's hard for another person to take over the task in case of that necessity. And that kind of necessities happen all the time – people might get sick, they may go on vacations or they just move on to other tasks, projects or jobs, so no ownership silos should happen in a healthy project.

How is Code Review related with this problem? By continuous Code Review happening as an integral part of the development process, we're ensuring that there is no line of code that hasn't been seen by another team member. Code Review might be an enabler for the collective code ownership. It may support code reuse and help the team establish a general shared knowledge about the codebase. The team is then also able to identify cases such as overlapping, conflicting or missing features or just to ensure everyone on the board understands the problem domain and the tasks on hand the same way. And this leads us directly to the next thought:

## Maybe it's not only about the code?

What if we take the idea even further and put much more emphasis on the "Review" part of the Code Review than on the "Code" part? Given that we already spend time talking together and looking at what we've done, maybe it also makes sense to think if the piece of code we've just written is the thing we should have done in the first place. Maybe for the sake of feature consistency it should be written differently? Maybe it is not needed at all as the task might be already accomplished somewhere else in the product we're building? Maybe we have missed an important requirements update? Or maybe the requirements were not clear enough and we've just assumed too much based on it so we need to take a step back and figure out what are the goals and expectations for the given task first?

Taking this idea even further, let me throw the question – how much of the work that is normally attributed to the QA part of the software development process (and possibly to the dedicated SQA people) can be done within the (Code) Review? How many bugs and deficiencies can be identified earlier? And – as a result – how regular Code Reviews influence the development cost? Can it actually make it lower despite the time we need to invest in it? My unquantified gut feeling is that it's worth it.

## What should Code Review look like?

The best summary of what the Code Review might look like, which is in line with my wide understanding of this process, I've found in [SmartBear blog article](https://blog.smartbear.com/development/creating-your-code-review-checklist/). Let me quote it here:

> Does my code compile without errors and run without exceptions in happy path conditions?
>
> Have I checked this code to see if it triggers compiler or static analysis warnings?
>
> Have I covered this code with appropriate tests, and are those tests currently green?
>
> Have I run our performance/load/smoke tests to make sure nothing I’ve introduced is a performance killer?
>
> Have I run our suite of security tests/checks to make sure I’m not opening vulnerabilities?
>
> Does this code read like prose?
>
> Do the methods do what the name of the method claims that they’ll do? Same for classes?
>
> Can I get an understanding of the desired behavior just by doing quick scans through unit and acceptance tests?
>
> Does the understanding of the desired behavior match the requirements/stories for this work?
>
> Is this code introducing any new dependencies between classes/components/modules and, if so, is it necessary to do that?
>
> Is this code idiomatic, taking full advantage of the language, frameworks, and tools that we use?
>
> Is anything here a re-implementation of existing functionality the developer may not be aware of?

What is also inevitable while trying to make Code Review an integral part of our process is that we should expect every team member to participate. And this participation should have an equal status – Code Review is not about the more senior developer serving as a gatekeeper for a junior's code. It's also about juniors reviewing senior's code with the same sense of seriousness. And if a junior is intimidated when asked to comment on the senior's code – just think: is there any better way to make a progress than reading a good code? And seniors are not unerring – when the less experienced person needs to ask questions to understand the analyzed code, maybe it's not that good after all?

Last but not least, a successfully finished Code Review should become a part of our [definition of done](https://www.scrum.org/resources/scrum-glossary) - unless the code was reviewed and accepted by another team member(s), we can't move on and mark it as completed or treat it as finished. It should be treated on the equal rights with writing unit tests – not an optional addition we fancy from time to time, but a thing that – when missing – causes a warning flag to be raised.
