---
layout: post
title: Builder pattern in Kotlin
tags: [kotlin, builder, pattern]
comments: true
hidden: true
author: agnieszka
image: /images/builder-pattern-in-kotlin/builder.jpeg
---

Builder pattern might be used in regular code, but I personally find it the most useful in tests. This is where you need to create objects which on one hand need to meet certain circumstances and on the other hand  you do not want to be bothered with other parameters. The builder pattern is the answer.

![Image](/images/builder-pattern-in-kotlin/builder.jpeg){: .center-image}

Let’s jump straight to a code example. We have a basic class representing a person that can have a number of friends.

```kotlin
class Person (var name: String,
	var surname: String,
	var age: Int,
	var gender: Gender,
	var friends: Array<Person>)
```

There is also an enum:

```kotlin
enum Gender {
	Male,
	Female
}
```

Now we will create the builder class. First of all we need a private field for every field of our Person class together with a meaningful and valid default value.

```kotlin
class PersonBuilder {
	private var name: String = "John",
	private var surname: String = "Doe",
	private var age: Int = 21
	private var gender: Gender = Gender.Mail,
	private var friends: MutableArray<Person> = mutableArrayOf()
}
```

Now we need a method for each parameter to make possible to overwrite it. Each method is returning `this` so that we can chain the methods and therefore achieve the fluent interface. 

```kotlin
fun withName(name: String) {
	this.name = name
	return this
}
```

To get the actual object we need to have one more method - the `build` method.

```kotlin
fun build() : Person = Person(name, surname, age, gender, friends.toTypedArray())
```

We can use our builder class in a test method.

```kotlin
val person = PersonBuilder()
	.withName("Jane")
	.withGender(Gender.Female)
	.build()
```

In the test methods I often need just one element in the array, so I find it useful to create another method which allows for adding a single person to the array:

```kotlin
fun withFriend(friend: Person) : PersonBuilder {
	this.friends.add(friend)
	return this
}
```

Another great thing you can use along with the builder pattern are domain specific methods. Say you need an under-aged person for your tests. You could just pass the age of say 15 into the `withAge` method:

```kotlin
val underAgedPerson = PersonBuilder().whitAge(15).build()
```

Does it clearly show the purpose? Not really. This is a kind of a magic number. Let’s add two more methods to our builder class:

```kotlin
fun withAgeOfMaturity() {
	this.age = 19
	return this
}
fun withAgeOfUnderAged() {
	this.age = 15
	return this
}
```

And now we can use it as so:

```kotlin
val underAgedPerson = PersonBuilder().withAgeOfUnderAged().build()
```

Another typical case is when you need a set of parameter values mixed together to create a meaningful object. Say you want to create a woman person - not only do you want to set the gender but also add some feminine name.

```kotlin
val woman = PersonBuilder().withGender(Gender.Female).withName("Jane").build()
```

You can add a `build` method for this purpose:

```kotlin
fun buildWoman() : Person = Person("Jane", surname, age, Gender.Female, friends.toTypedArray())
```

Creating another `build` method for every case you can think of is a waste of time and energy. There are two main conditions to be met to decide that you need a specific `build` method:

* a set of values tend to repeat in your tests,
* the set of values together create a specific domain object.

You will know the second condition is met if you can name the `build` method with the domain specific language :)

**Koltin Named And Default Arguments**

There is another approach I’ve come along recently which made me realize I was using Java approach poorly adapted in Kotlin. You can make a great use of Kotlin default arguments as well as named arguments in the constructor. You can read the whole story [here](https://praveer09.github.io/technology/2015/12/26/writing-test-data-builders-made-easy-with-kotlin) or move on to an example.

Instead of writing each `with` method you just declare the private fields as optional constructor parameters. The `build` method stays the same as before.

```kotlin
class PersonBuilder (
	var name: String = “John”,
	var surname: String = “Doe”,
	var age: Int = 21
	var gender: Gender = Gender.Mail,
	var friends: MutableArray<Person> = mutableArrayOf()) {
	
	fun build() : Person = Person(name, surname, age, gender, friends.toTypedArray())
}
```

In the forementioned blog post, the author uses immutable properties. However, if we use mutable ones, we can still make use of the additional domain specific methods. This is how the builder class looks now:

```kotlin
class PersonBuilder (var name: String = "John",
	var surname: String = "Doe",
	var age: Int = 21
	var gender: Gender = Gender.Mail,
	var friends: MutableArray<Person> = mutableArrayOf()) {
	
	fun build() : Person = Person(name, surname, age, gender, friends.toTypedArray())
	
	fun buildWoman() : Person = Person("Jane", surname, age, Gender.Female, friends.toTypedArray())
	
	fun withFriend(friend: Person) : PersonBuilder {
		this.friends.add(friend)
		return this
	}

	fun withAgeOfMaturity() : PersonBuilder {
		this.age = 19
		return this
	}
	
	fun withAgeUnderAged() : PersonBuilder {
		this.age = 15
		return this
	}
}
```

And this is how we can use it in tests:

```kotlin
val underAgedPerson = PersonBuilder(name = "Mickey").withAgeUnderAged().build()
val woman = PersonBuilder(surname = "Smith").buildWoman()
```

**Summary**

Although I am an enthusiast of TDD and clearly see all the advantages of this approach, sometimes it feels really tempting to ignore the tests and go straight to coding. The more convenient tests are, the more willing you are to write them. The builder pattern is an example of what makes the tests easier to write. And easier to read, which after all might be even more important :)
