---
layout: post
title: Walking skeleton
author: mateusz
hidden: false
tags: ['agile', 'project management', 'continuous integration', 'continuous delivery', 'spike']
comments: true
---

## What satisfies your client?

Do you know what really makes your client satisfied? Tons of unit tests? Advanced integration tests running on every machine using Docker? Dozens of thousands of lines of a well-formatted, clean code? Or maybe a new open source library that every programmer is talking about? Actually, none of them.

## The outcome

What clients really care about, is the outcome. They value what they can see and touch, they appreciate the visible progress, they admire when their polished long dreamed idea is being brought to life.

Does it mean that all those unit and integration tests, continuous integration and delivery processes, design patterns and clean code practices are less important than a visible progress? Not really, every mature client understands that those practices are necessary if you to work on the project effectively for a longer time, but even the most experienced **client will value the outcome more**.

## Walking Skeleton

Instead of starting a project with a Sprint 0 when you set up everything, configure a robust environment, integrate advanced crash tracking, logging, reporting, and analytics systems, start with a **tiny implementation that performs small end-to-end function**.

This technique is called a **walking skeleton**. It was first referred by Vic Basili in his paper [“Iterative Enhancement: A Practical Technique for Software Development“](http://www.cs.umd.edu/~basili/publications/journals/J04.pdf) from 1975. Walking skeleton won’t use the final architecture, but it should link together the main architectural components.

![image1](/images/walking-skeleton/skeleton.jpg)

The walking skeleton is not complete, it doesn’t have any “flesh”. It’s missing functionality, which is built along with the infrastructure incrementally, over time. You can consider it as an outline of your concept that is executable and shippable.

A walking skeleton is different than spike, although the difference is subtle. Spike is either a particular component of functionality or a rough sketch of a system to verify the idea, which is intended to answer the question “Are we heading in a good direction?”, and it’s thrown away afterwards. On the other hand, a walking skeleton is a permanent code built with production habits, accompanied with tests, intended to grow with a system.

## Get a walk in your client's shoes

Next time, while running a new project, try to take a walk in your client’s shoes. Always bear in mind that your clients are spending their money on a software that might be their only chance to hit the market with the product of their dreams.

**Pay attention to the quality**, but also pay attention to **how the client perceives your work**. We should always remember that even the most advanced technical solutions, though well-communicated, won’t change the bad impression when there is no visible progress for a long period of time.
