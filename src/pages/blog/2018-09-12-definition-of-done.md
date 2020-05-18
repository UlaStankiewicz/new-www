---
layout: post
title: Definition of Done
author: mateusz
tags: ['programming practices', 'project management']
comments: true
image: /images/definition-of-done/dictionary.jpg
---

I have often heard that something is "almost ready". This term is vague and brings more confusion than information. According to the [Ninety-Ninety rule](https://brightinventions.pl/blog/dont-be-mockup-developer/#ninety-ninety-rule), 90% of the code is implemented during 90% of the project time and the remaining 10% of the code ("almost ready features") can take even the same amount of time which would lead to massive project delays.

Incomplete work has a tendency to mount up, and without visibility of how much effort truly remains, the deficit can quickly get out of hand. For this reason, determining the Definition of Done is crucial for every project. Otherwise, you can only hum the Sad Project Manager song:
>What is done?
>
>Devs don't hurt me
>
>Don't hurt me
>
>No more

## There is no single definition

The Definition of Done (DoD) is a list of features and activities that add verifiable/demonstrable value to the product. It can be also defined as a list of steps that has to be completed in order to finish a feature. Verifying the Definition of Done will ensure that you are delivering features that are truly done, not only in terms of functionality but in terms of quality as well.

Preparing a single DoD that suits every situation is impossible. Each team should collaborate and come up with the definition that suits its unique environment. First, you should define the artifacts that need to be delivered to the end customer (applications, documentation, release notes, etc.). Then, considering the current context and capability, you should decide which activities can be completed in each Sprint. Some criteria may not be mandatory (like considering analytics or internationalization) depending on the context. For a Scrum purist, such optional criteria should not be included in the Definition of Done. In my opinion, they help the team to remember about the requirements that have to be met in certain situations.

![Dictionary image](/images/definition-of-done/dictionary.jpg)

The Definition of Done does not only apply to the features/stories. According to the [Scrum Alliance](https://www.scrumalliance.org/community/articles/2008/september/what-is-definition-of-done-%28dod%29), teams may have a different DoD at various levels:
>- Definition of Done for a feature (story or product backlog item)
>
>- Definition of Done for a sprint (collection of features developed within a sprint)
>
>- Definition of Done for a release (potentially shippable state)

## Feature stages

In the projects I run, features/stories are broken down into stages with criteria for each step. To satisfy the Definition of Done all stages have to be completed and all the criteria met. It is key to deliver a high-quality product that follows the industry standards. Describing the feature stages ensures that everyone in the team knows exactly what is expected of everything the team delivers. It also allows me to verify at what stage the feature really is, and if it stays for too long at some phase, it is a signal that something might be wrong.

The example feature stages I use:
1. Open
  - Waiting for assignment
1. In progress
  - Assigned, work in progress (WIP)
1. On hold*
  - Optional, in case the work cannot be continued
  - Action required (AR)
1. Implemented/Ready for review
  - Code written in accordance with the standards
  - No linter errors, no compiler warnings (unless reasoned)
  - Unit tests passed
  - Changes documented*
  - i18n considered*
  - Analytics considered*
  - Security & Data Protection considered*
  - Code pushed to the remote repository
  - Automatically built on the CI server
  - Application deployed from the CI server to the staging environment
  - Ready for peer review (feature testing + code review)
1. Deployed/Ready for QA
  - Passed peer review
  - Ready for acceptance testing
1. **Done**
  - Passed acceptance tests
  - Can be immediately deployed to the production environment

Bear in mind that feature stages may depend on many factors like peer review process, application environments, deployment process, acceptance testing and the way you cooperate with the client. They are never fixed and should be determined for each project individually.

## Win-Win

![Happy image](/images/definition-of-done/happy.jpg)

Clear workflow and unequivocal Definition of Done are necessary for the smooth work of the team. When the project manager is well informed about the progress and possible delays, he can communicate it well to stakeholders. In case of any obstacles, he can respond quickly and facilitate the development process. On the other hand, developers do not have the stressful feeling of prolonged work over the feature because it is divided into clear phases. The Definition of done ensures that you are delivering features that are truly done at the appropriate level of quality.
