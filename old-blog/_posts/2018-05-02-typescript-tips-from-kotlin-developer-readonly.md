---
layout: post
title: TypeScript tips from Kotlin developer - readonly
author: piotr
tags: [TypeScript, Kotlin, readonly, immutability]
comments: true
crosspost: false
image: /images/kotlin/kotlin-logo.png
---

Last time I wrote about using [`const` in TypeScript]({% post_url 2018-04-11-typescript-tips-from-kotlin-developer-const %}). This time I will focus on another TypeScript keyword that aids immutability: `readonly`.

## `readonly` properties

In Kotlin a `val` keyword can be used to declare a read only property:

```kotlin
class Timer(val start: DateTime){
    val elapsed: Duration get() = DateTime.now() - start
}

val now = Timer(DateTime.now())
println("Elapsed: ${now.elapsed}") 
now.start = DateTime.now() // Error: Val cannot be reassigned
now.elapsed = DateTime.now() // Error: Val cannot be reassigned
```

In the above example we have 2 properties:

 - `start` is a read only property which value does not change
 - `elapsed` is a read only property that returns different values

In [TypeScript](https://www.typescriptlang.org/) the equivalent behavior is achieved with a help of the [`readonly` keyword and getter only properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#readonly-properties):

```typescript
class Timer {
    constructor(readonly start: Date) { }

    get elapsed(): number {
        return new Date().getTime() - this.start.getTime();
    } 
}

const now = new Timer(new Date())
console.log(`elapsed: ${now.elapsed}`)
now.start = new Date() // Error: Cannot assign 'start' because it is a constant or a read-only 
now.elapsed = new Date() // Error: Cannot assign 'elapsed' because it is a constant or a read-only 
```

The above examples highlights an important difference between `const` and `readonly`: a `readonly` property value can change.

Note that the error message we get when trying to assign `start` and `elapsed` is the same even though the properties are declared using different language constructs. This makes sense though. From the caller perspective both properties are read only.

## Treat mutable as immutable with `Readonly<T>`

One advantage TypeScript has over Kotlin is the ability to easily declare an immutable version of an interface.
Let us assume that we have an existing interface that is naturally mutable e.g. any regular JavaScript object. 

```typescript
const ala = { firstName: "Ala", lastName: "MaKota", points: 0 }
// let's use ala as a template and grab its type
type Person = typeof ala

function newPersonWithBonusPoints(person: Person, amount: number): Person {
    person.points = person.points + amount;
    return person;
}

const newAla = addPoints(ala, 3)
```

The function `newPersonWithBonusPoints` as the name suggests should return a new person with new `points` value. However, there it is still possible for us to make a mistake when implementing `newPersonWithBonusPoints` and mutate the supplied instance instead of creating a new one. How can we ensure `newPersonWithBonusPoints` function does not mutate the argument? With the help of `Readonly<T>` this is easy:

```typescript
const ala = { firstName: "Ala", lastName: "MaKota", points: 0 }
// let's use ala as a template and grab its type but make it read only
type Person = Readonly<typeof ala>

function newPersonWithBonusPoints(person: Person, amount: number): Person {
    person.points = person.points + amount; //Error: Cannot assign to 'points' because it is a constant or a read-only property
    return person;
}
```

Notice how with a single `Readonly<T>` we can turn any type into its read only equivalent. It is worth mentioning that the `Readonly<T>` is shallow i.e. nested objects are still mutable unless explicitly stated otherwise. Thankfully version [TypeScript 2.8]
(https://github.com/Microsoft/TypeScript/pull/21316) introduced an ability to define a `DeepReadonly<T>` that makes it possible to mark a type as immutable e.g.:

```typescript
interface Address {
    city: string
    street: string
}

interface Person {
    address: Address | null
    firstName: string
    nickNames: string[]
}

const ala: DeepReadonly<Person> = {
    address: { city: "Gdańsk", street: "Słonimskiego" },
    firstName: "Ala",
    nickNames: ["lol"]
} as Person


ala.address.city = 'Name' // Error: cannot assign city because it is constant or readonly
ala.nickNames.push('Kot') // Error: property push does not exist on type DeepReadonlyArray<string>
``` 

In the example above the compiler does not allow modifying nested `address` object. Interestingly it also forbids mutating the `nickNames` array.

### Runtime safety with `Object.freeze`

The `Readonly` and `DeepReadonly` will make it impossible to mutate an object in sane fashion in TypeScript code. However, at runtime it is still possible to inadvertently mutate an object where not desired or use a library that mutates a passed in parameter:

```typescript
interface Config {
    readonly port: string
}
// a problematic function that mutates an argument
function start(config) { 
    const c = Object.assign(config, {
        port: config.port ? parseInt(config.port) : 80
    })
}

const config: Config = {
    port: '80'
}

start(config)

if (config.port === '80') { 
    console.log('Handle default http port'); // This will not be printed!
}
```

To avoid such issues I often use [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) which will make the above example throw an error on the line with `Object.assign`: `TypeError: Cannot assign to read only property 'port' of object '#<Object>'`. As you can see, the error is now reported right where the problem is introduced.
