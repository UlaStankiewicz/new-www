---
layout: post
title: Comparison sorting part 1
tags: [sorting, algorithm, bubble, insertion, selection, gnome, cocktail]
comments: true
author: grzesiek
hidden: false
excerpt: Sorting data is one of the most important tasks that computers have been doing since they were invented. Over those years developers have found many ways of doing it. 
---

Sorting data is one of the most important tasks that computers have been doing since they were invented. Over those years developers have found many ways of doing it. Some of these ways are quite fast, others involve  interesting methods and finally there are some which are practically useless, but still it is better to know more than to know less, so it’s better to learn them  in free time.

For this series of blog posts I will divide sorting algorithms by their complexity:

**Group 1:** which average case complexity is n^2, like bubble, insertion sort

**Group 2:** which average case complexity is nlog(n), but worst is n^2, like quick, library sort

**Group 3:** which worst-case complexity is nlog(n), like merge, heap sorts

Today I will show you a few examples from the first group. They are used mostly by beginners because they are the simplest ones. Unfortunately, there is a cost of their simplicity - long working time. N^2 complexity doesn’t sound bad when we talk about small data chunks like 100 elements - it’s just 10,000 operations. But when our program has to sort 1 million elements it takes 1 trillion of operations to do. Let’s move to real coding now. I’m going to use Kotlin, but it’s easy to translate every algorithm into other languages.


### 1) Bubble

A very simple algorithm, usually the first one that young programmer learns. Its idea is to compare each element with the next one and move bigger one to the right, which at the end of one loop finds the biggest element of an array. Then do it again and again excluding the elements that had been already found in the previous loops.

```kotlin
fun bubbleSort(array: IntArray) {
   var maxIndex = array.size-1
   for(i in 0..maxIndex) {
       for(j in 1..maxIndex) {
           if(array[j-1] > array[j]) {
               var temp = array[j-1]
               array[j-1] = array[j]
               array[j] = temp
           }
       }
       maxIndex--
   }
}
```


### 2) Insertion

Another basic algorithm. What it does is taking all elements one by one and putting them in the right place by comparing each  to every previously checked element.

```kotlin
fun insertionSort(array: IntArray) {
   val maxIndex = array.size-1
   var j: Int
   for(i in 1..maxIndex) {
       var temp = array[i]
       j = i - 1
       while(j >= 0 && array[j] > temp) {
           array[j+1] = array[j]
           j--
       }
       array[j+1] = temp
   }
}
```


### 3) Selection

As its name suggests it selects the smallest element of the collection and puts it in the beginning. It repeats without previously found elements until our collection is sorted.

```kotlin
fun selectionSort(array: IntArray) {
   val maxIndex = array.size-1
   var minimum: Int
   var indexOfMinimum: Int
   for(i in 0..maxIndex) {
       minimum = array[i]
       indexOfMinimum = i
       for(j in i+1..maxIndex) {
           if(array[j] < minimum) {
               minimum = array[j]
               indexOfMinimum = j
           }
       }
       if(i != indexOfMinimum) {
           var temp = array[i]
           array[i] = array[indexOfMinimum]
           array[indexOfMinimum] = temp
       }
   }
}
```


### 4) Gnome

It’s like combining insertion with bubble sort. We check every element in a single loop and swap it with the previous one as long as it’s not in the right place.

```kotlin
fun gnomeSort(array: IntArray) {
   val maxIndex = array.size-1
   var pos = 0
   while(pos < maxIndex) {
       if(pos == 0 || array[pos] >= array[pos-1]){
           pos++
       } else {
           var temp = array[pos]
           array[pos] = array[pos - 1]
           array[pos - 1] = temp
           pos--
       }
   }
}
```


### 5) Cocktail

It’s also called bidirectional bubble sort - going forward it compares elements looking for the the biggest one and going backward it seeks the smallest one.

```kotlin
fun cocktailSort(array: IntArray) {
   var maxIndex = array.size-1
   for(i in 0..maxIndex) {
       for(j in 1..maxIndex) {
           if(array[j-1] > array[j]) {
               var temp = array[j-1]
               array[j-1] = array[j]
               array[j] = temp
           }
       }
       for(g in maxIndex downTo 1) {
           if(array[g-1] > array[g]) {
               var temp = array[g-1]
               array[g-1] = array[g]
               array[g] = temp
           }
       }
       maxIndex--
   }
}
```


So, now when we’re done with the code, let’s look at the results.

**Sample #1:** 100 arrays of 1000 integer numbers:

```
Avg of bubble sort: 1.59
Avg of insertion sort: 0.18
Avg of selection sort: 0.38
Avg of gnome sort: 1.08
Avg of cocktail sort: 1.65
```

**Sample #2:** 100 arrays of 10000 integer numbers:

```
Avg of bubble sort: 156.39
Avg of insertion sort: 13.01
Avg of selection sort: 30.25
Avg of gnome sort: 104.22
Avg of cocktail sort: 169.53
```

Increasing the amount of data 10 times has caused these time multiplications: 

```
Bubble: ~98 times longer
Insertion: ~72 times longer
Selection: ~79 times longer
Gnome: ~97 times longer
Cocktail: ~103 times longer
```


As we can see for all algorithms increasing the amount of data 10 times has caused time to increase around 100 times, which confirms that their complexity is n^2. Insertion and selection sorts are a little bit better, but it’s still n^2, so we should use it as a last resort.


That’s all for this part. Soon I will prepare the comparison of algorithms from group 2.


**PS.** This post has assured me of one thing - Internet lies. Most sources say that comb sort average- and worst-case complexity is n^2, but my tests prove different. After a long research I have even found a book which says about nlog(n) complexity. You could read more about that soon. 
