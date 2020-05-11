---
layout: post
title:  How do we use Git at Bright Inventions?
excerpt: Even though at Bright Inventions we use a number of technologies and work on multiple software stacks, we have a few practices that are common and widely accepted across all projects and stacks. One of these things is how we use source control, namely Git. Some parts of our workflow is highly subjective and some might even be regarded as controversial or suboptimal. Let me guide you through our process and explain some of our rationales.
tags: [git]
comments: true
author: adam
image: /images/git/wild-merges.png
---

Even though at Bright Inventions we use a number of technologies and work on multiple software stacks, we have a few practices that are common and widely accepted across all projects and stacks. One of these things is how we use source control, namely Git. Some parts of our workflow is highly subjective and some might even be regarded as controversial or suboptimal. Let me guide you through our process and explain some of our rationales.

## Branching model

There are several branching models or flows out there for Git. Some people can't imagine the project without a [full-fledged GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) in place. Some are hardcore `master`-only believers. We're somewhere in between. Our flow is mostly based on [Feature Branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) – we have the main line in `master` and we mostly work in the short-living branches dedicated to a single feature. When the feature is ready (ideally, already [after the review](https://brightinventions.pl/blog/what-are-code-reviews-for/)), we squash its commits as much as it makes sense and then rebase the squashed commit (or commits) it onto master. Then it gets merged into master. 

Let's dissect this flow into some smaller chunks.

### Initial work

We get a new ticket/issue assigned (ideally because we've chosen it from the planned list). Assuming we're up to date with remote `master`, we start with creating a feature branch for our issue:

```
git checkout -b PROJ-123
```

The convention we often use is to name the feature branches according to the JIRA ticket that describes our feature, but let's not be religious here, as long as the name communicates obviously what the branch is about. It's important since we're going to push this feature branch to the remote repository, too, and especially important if we're going to collaborate with others.

Then, let the work begin. Every time we reach a stable point in our implementation (but not necessarily end-to-end complete), we commit our changes to our feature branch. [Commit early, commit often](http://blog.beanstalkapp.com/post/147799908084/commit-early-commit-often), they say, and we agree. It might mean we have a few commits every hour, and this is totally fine, as long as we name the commits well enough for us to understand the history and be able to revert in case we need it. No strict rules here as this branch is still our private lawn, outside of `master`. 

```
git add .
git commit -m "WIP invoices listing; filtering UI done"
```

But private doesn't mean local-only, though. For the sake of data safety and backup, as well as for the merits Continuous Integration gives us (see later), we push these private changes to the remote counterpart of our feature branch in the remote repository. We should never leave work uncommitted and not pushed to the remote repo at the end of the day, let only to ensure our work is not lost if we need to take an unexpected week of sick-leave or in case something bad happens to our equipment overnight.

```
git push
# or, for the first push of the new feature branch
git push --set-upstream origin PROJ-123
```

### Getting things ready

When our work is feature-complete (or is in the state that makes it feasible for peer review), for the courtesy of the reviewers, we should clean the Git history a bit by [squashing](https://medium.com/@slamflipstrom/a-beginners-guide-to-squashing-commits-with-git-rebase-8185cf6e62ec) the checkpoint revisions and fix-ups. We do that by using [interactive rebase](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html). It's also a good moment to actually synchronize our code with the mainline by targeting our rebase to the current tip of `master` that might have already moved away while we were working on the feature branch:

```
git fetch # make sure we know the state of the origin
git rebase -i origin/master
```

Rebasing is a complex process. It's easier to reason about it if we have the branches tree imagined or drawn in front of us – I'd highly recommend it for beginners. With rebase, we "cut out" the branch we were working on from the point it was attached to and replant it to another place specified (tip of `master` in our case). The changes are applied commit-by-commit. In a sense we instruct Git to redo our work from the feature branch again on top of another starting point. So if we changed a variable name in our feature branch that originated from commit `A` when it was the tip of `master`, Git tries to apply exactly this change on the current tip of `master`, whatever it is. It applies standard conflict resolution techniques, so that it might fail. We need to resolve the conflicts the same way we'd do it for classic merge. Contrary to merge, though, rebase creates new commits, pretending the work happened later in time and on later baseline than it actually happened. This is the most controversial part, I guess – let me discuss it [later](#buts).
 
After the rebase we have our work reduced to single or a few meaningful commits and applied on top of the most recent changes available. We need to share our rebased changes with the world. This time the simple `git push` fails because with rebase we rewrote the branch history and we're out-of-sync with what has already been pushed (we've dropped the WIP-style commits that were previously pushed and we have a few new and shiny instead). So we do one more thing that some may see as controversial – we force-push our feature branch, so that those dropped commits are also forgotten by the remote repository:

```
git please
```   

Wait, what? There's no such Git command. What we use here is a [custom alias for `git push --force-with-lease`](https://medium.freecodecamp.org/git-please-a182f28efeb5). It's not that aggressive as plain `--force`, because it can only overwrite the commits we have already known in our local copy – we'll be rejected in case there are some more commits on the remote that we're not aware of. Plain `--force` would overwrite them without even informing us, so in case we collaborate on the feature branch with someone else, we're on the good path to destroy their work. Actually, I believe `--force` should not be available at all. There's no legit case I can see for forcing push, `--force-with-lease` should be the only forceful method allowed. And when we alias it to `please` (note it's an abbreviation for push+lease), we're also more kind and less... pushy 😆.

### Review time

When our changes are there on the remote repository, we can now proceed to peer review. At Bright, we're all-in JetBrains aficionados, so obviously we use [Upsource](https://www.jetbrains.com/upsource/) for this purpose. Our approach to reviews was [already described here](https://brightinventions.pl/blog/what-are-code-reviews-for/), so let's skip it here. What is important, though, is that code review will probably result in more commits in the now-rebased feature branch and this is fine, including more WIP-style commits. Let's continue working on the branch for as long as it's needed to successfully complete the review. Ideally, we should be rebasing often onto `master` to ensure our feature branch is still in sync with the mainline, but it has a major disadvantage in our flow – Upsource tends to lose comments on the code when the commits it was attached to gets rebased. Keeping this in mind, we're looking for the right balance of convenience vs. incompatibility risk.

After the review is completed, all the review-related commits can be squashed again, if needed, and the branch should be rebased onto the newest `master`, again. It's the time to merge it into `master` and push:

```
git checkout master
git merge --ff-only PROJ-123
git push 
```

The `--ff-only` flag is not technically needed, but it's a sanity check we actually did the rebase correctly and the whole merge will actually be a [fast-forward operation](https://ariya.io/2013/09/fast-forward-git-merge) on `master` instead of a classic merge of two commit lines. We may even [configure it as a default merge behavior](https://medium.com/@mvuksano/git-tips-use-only-fast-forward-merges-with-rebase-c80c9d260a83).

There are alternative techniques of rebasing out there. If we want to squash all the commits of our feature branch into a single one, we may run `git merge --squash feature-branch` instead of rebase+merge pair. The effect is conceptually the same, so use whatever is handy for you.

The job is done now, but there's one more thing we should do before heading for a lunch – we should clean our repository up and delete our remote feature branch that is no longer needed. Unless we do it, our Git tree will become harder and harder to read over time, our tooling will need to work hard to draw it correctly, our CI will need to track useless stuff and our brains will need to filter them out. Let's get rid of it:

```
git push origin --delete PROJ-123
```

Now it's officially the lunch time 😉.

## But's

### But they say [rebase is bad](https://medium.com/@fredrikmorken/why-you-should-stop-using-git-rebase-5552bee4fed1)!

Rebase is controversial mostly because it rewrites the history and makes our change appear with the different chronology then when it actually happened for the developer. This is a fact we're going to accept, mostly because we find it not that important to reason about the state of the codebase in the moment the change was introduced by the developer on their local machine. What is important, though, is when it was introduced into the mainline (`master` in our case) and deployed. And it's much easier to reason about this when our history tends to be linear instead of going through the number of interleaving commit lines with "merge of merge" commits that tend to happen in the repositories where merge is the preferred behavior.

![Merges gone wild...](/images/git/wild-merges.png)￼￼￼

In our scenarios, the change isn't actually introduced to the codebase until it lands on `master`. And this is the moment we mostly care about. Rebase is equally precise about it as merge is, so let's keep things simple.

There's a culprit here, though. Rebase applies every single commit separately on the new base, so it means we can have multiple conflicts to resolve. Even more, if we need to rebase several times over time (i.e. because `master` went further ahead while our change was in review), we need to repeat this conflict resolution process multiple times. This is a pain that is partially addressed by [rerere technique](https://hackernoon.com/fix-conflicts-only-once-with-git-rerere-7d116b2cec67). But the best mitigation is to take care while defining scope and size of the tasks. Well-split task is small enough to ensure implementation doesn't last long: less than a day might be a good target threshold, but obviously – [it depends](http://blog.consulting101book.com/it-depends/). Well-split task (in a well-architected codebase) is also independent enough from other planned changes so that the number of conflicts is low enough to handle it. It's not easy in some cases, but it's worth it – the effects of well-planned tasks are profound and reach almost all aspects of software development process.

### But how to collaborate on a feature branch?

The fact that we're force-pushing our feature branch means the history is changing. So if someone relies on it, we may break their workflow. The question how to share the work in case it needs to be handled by more than one person is valid one, although given we already established the importance of small and well-separated tasks, it's not that common as it might seem. In most cases the need to collaborate on a feature before it's ready to push to `master` probably means it's not split granularly enough. Note that "ready to push to `master`" doesn't necessarily imply "ready to ship to customers". There is a multitude of techniques to decouple these two, [Feature Toggling](https://martinfowler.com/articles/feature-toggles.html) being the one we're most experienced with at Bright.

But if we really need to share the same feature branch with others, we can fall back to merging and "classic" Git collaboration techniques within the feature branch and get rid of it just before rebasing onto master. Git is a powerful beast. And eventually, merge is still a perfectly valid technique, if we're convinced we need to use it even on `master`, no kittens will die. An occasional non-linear piece of the history in Git wouldn't probably make it immediately unreadable.  

## Releasing model

We're believers of [Deploy early, deploy often](https://about.gitlab.com/2016/07/21/release-early-release-often/) principle as much as it's feasible to us and our clients. That's why we always invest in automation and Continuous Delivery procedures – we should never need to run any build by hand or from the developer's machine. This typically means we are able to deploy every single commit that lands on `master` into a staging environment of our applications. We ask our clients to use these staging environments as much as possible so that we can detect outstanding bugs before they reach production. In most cases we use staging builds for our internal needs, too – i.e. the mobile apps we currently have under development connect to staging backend environments, we run demos there etc. 

These facts require us to maintain a healthy state of `master` branch as much as possible because if `master` is broken, it may actually affect the work of many people. We consider it to be a good thing. To help with this order, we have Continuous Integration servers running [TeamCity](https://www.jetbrains.com/teamcity/) set up for every branch, so tests at our feature branches are continuously run, also before the changes land on `master`. This includes integration tests that operate on the real database engine or actual HTTP calls to the backend. Docker makes these things far easier than it was before – but this would be a topic for a separate article.

We always release every single commit for backend and web projects, where it isn't harmful to anyone (assuming we have no serious downtime while deploying). For mobile apps, in most cases we refrain from doing so for the pragmatic reasons – the build & release cycles are longer because of 3rd-parties involved (Google Play for Android and TestFlight for iOS) and also because of annoyance the clients have when they get the notifications about all the updates. And for the active project it's not unusual to have a dozen of commits every day. So for iOS and Android projects, we tend to have a scheduled trigger set in TeamCity that releases the changes every night and in case we need to have it faster – we can always push the button on the build server.

## Production maintenance

When the changes are battle-tested with staging build or on staging environment and the customer accepts it, we promote it to production – again, using automated procedures based on TeamCity, the same ones that were used to deploy to staging, just with a single flag flipped in most cases. We need to trigger the action manually – by hitting "Run" button whenever we agree it's the right time.

The code that was released to production environment needs to be tagged so that we can go forward with the development but still have enough knowledge to get back to the point that was released to prepare any hot-fixes, in case something is burning. We do that tagging differently depending on the lifetime model of the application. 

For backend or web-based solutions, we don't need to care about the previous versions – all we care is what's currently released. We use `production` branch (that is the only long-living branch besides `master`) that we force-reset to the released point of `master` after the deployment is done:

```
git push --force-with-lease origin master:production
```

For mobile apps, where the update cycle is not that obvious and in some cases we need to track many of the released versions simultaneously, we use Git tags that immutably point to the commit that was built and released to the stores. We use the version number as the tag name:

```
git tag release1.3
git push --tags
```

Both solutions give us a straightforward way to reset our development environment to the point in Git timeline that is relevant to work on bug fixes that need to be released "as ASAP as possible".

## Git tooling

Even though all the commands in this article refer to the plain old command-line interface, there's nothing wrong in using the visual tools to make our life easier if we're not a CLI fans. There is one extremely important condition, though. We need to understand what exactly our tool does in terms of Git commands, otherwise we're not Git users but only prisoners of our tool of choice that we blindly trust. But tools are only as smart as the users of these tools are – one wouldn't paint a world-level painting only thanks to buying a nice brush.

My personal preference is a mix of raw Git and WebStorm/IntelliJ built-in support. I commit from IDE because it's easy but I rebase from CLI because I need to feel the control. But it's subjective and everyone needs to find their own tooling zen. 

If you decide to use CLI to some extent, here is a set of useful aliases we often use for convenience. You can paste it into your `.gitconfig` file that is most probably located in your "home" directory.

```
    [alias]
    st = status
    ci = commit
    ciam = commit -am
    br = branch
    co = checkout
    lg = log -p
    lol = log --color --graph --decorate --pretty=format:'%C(red)%h %Cgreen%cr %Cblue(%an)%C(yellow)%d%Creset %s' --abbrev-commit --all
    lola = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --all
    unstage = reset HEAD
    reseth = reset --hard
    please = push --force-with-lease
    halp = reflog --date=iso # halp is more than help
```

Have a great push!
