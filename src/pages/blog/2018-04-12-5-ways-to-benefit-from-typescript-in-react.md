---
layout: post
title: 5 (or more) ways to benefit from TypeScript in React projects
excerpt: TypeScript in React projects provides us with all the goodies of type checks and eliminate the whole class of errors and typos from our codebase. Let’s see how we can apply TypeScript-based type definitions into our React project to get most of it.
tags: [React, TypeScript, web]
comments: true
author: adam
image: /images/react-ts/props-immutable.png
---

In the [recent post](https://brightinventions.pl/blog/modern-way-getting-started-react-typescript/) we discussed how we can start a new React project with TypeScript to benefit from all the goodies of type checks and eliminate the whole class of errors and typos from our codebase. Now let’s see how we can apply TypeScript-based type definitions into our React project to get most of it.

To get started, as with every library we want to have the TypeScript support for, we need to grab the type definitions first. As usual, the way to do it is using the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) project and run:

```bash
npm install --save-dev @types/react @types/react-dom
```

## The basics – Components

The components in React are in most cases ES6 classes that extend React-provided `Component` class. TypeScript is adding two generic arguments to this base class definition – the first one defines what our props are and the second is for the local component’s state.

```typescript
interface HelloProps {
    greeting: string
}

interface HelloState {
    wasDisplayed: boolean
}

class HelloWorldComponent extends React.Component<HelloProps, HelloState> {}
```

By adding these two definitions we’re not only adding a code completion capability to our component. Here I denoted I expect a `greeting` property and marked it as non-optional (no `?` sign before a colon and no union type that allows `undefined` to sneak through). The compiler now successfully prevents us from using this component without the proper `greeting` property passed in.

![Props completeness is enforced](/images/react-ts/props-undefined.png)

### Props & state (im)mutability

But there’s more. In React, both props and state are intended to be immutable. Props are for getting the data into the component only and state is to be modified via the specialized `setState` method. Thanks to both props and state defined as being of type `Readonly<>`, we are protected from accidentally mutating it:

![Props immutability is enforced](/images/react-ts/props-immutable.png)￼

As well as we’re not allowed to monkey-patch it, that is to add new properties there:

![Props are frozen](/images/react-ts/props-frozen.png)￼

Having said that, we must be aware that `Readonly<>` is not deep (recursive) – it only protects us from mutating the root level of the object, nothing protects its children objects:

```typescript
interface State {
    inner: {stuff: string}
}

// this is still possible
this.state.inner.stuff = "inner’s properties are still mutable"
``` 

Until React's typings implement the proper support for deep Readonly ([which is possible starting from TypeScript 2.8](https://github.com/Microsoft/TypeScript/pull/21316)), the best we can (and should) do is to ensure on our own that all the properties of both props and state of our components are also marked as `Readonly<>` (as well as its inner properties, ad infinitum):

```typescript
interface State {
    inner: Readonly<{stuff: string}>
}

// now we’re safe again
this.state.inner.stuff = "this does not compile anymore"
```

### `setState` correctness

Another class of errors we’re automatically protected from is when we call `setState` with an invalid object. The first parameter of this function is defined with a rather cryptic type declaration:

```typescript
state: ((prevState: Readonly<S>, props: P) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
```

But when reading piece by piece it tells us we either need to pass a function that returns `Pick<S, K> | S | null` or return it directly. And that `Pick<S, K> | S | null` thing is – reading backwards – either `null`, full state object itself (`S`) or an object with a subset of the state’s keys ([`Pick<S, K>`](https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)). To cut the long story short, we are unable to pass the new state value object that doesn’t match our state definition. Here is the error that the TypeScript compiler gives us instead:

![State correctness is enforced](/images/react-ts/state-correctness.png)￼￼

## Stateless components

Seasoned React developers are probably familiar with the simplest form of components available – [stateless functional components](https://hackernoon.com/react-stateless-functional-components-nine-wins-you-might-have-overlooked-997b0d933dbc). These are defined as pure functions that receive the props and return an JSX element. As simple as that, from the typing perspective it is usually  sufficient to treat it like any other function – specifying types of its parameters and optionally the return type:

```typescript
interface InputProps {
    value: any
    onChanged: () => void
}

function Input(props: InputProps) {
    return <input type="text" onChange={props.onChanged} value={props.value}/>
}
```

We can have a problem here, though, if we want to specify `propTypes` or `defaultProps` for our stateless component. TypeScript will complain as plain functions do not have that kind of properties defined:

![PropTypes cannot be added to plain function](/images/react-ts/propTypes.png)￼￼

We can solve it by declaring our component in a slightly different manner:

```typescript
const Input: React.StatelessComponent<InputProps> = function (props) {
    return <input type="text" onChange={props.onChanged} value={props.value}/>
}

Input.propTypes = {
    value: PropTypes.any.isRequired
}
```

But let’s stop and think for a moment what we’re trying to achieve here. Doesn’t TypeScript give us a similar level of type safety with much more convenience already? I find [using PropTypes not needed anymore](https://dbushell.com/2017/04/19/typescript-instead-of-react-proptypes/) at all.
 
## Events

Our next stop in the React world that might make use of stronger typing is around Events system. We take care of events every time we want our component to react to user actions. Let’s see our simplistic `Input` component once again:

```typescript
interface InputProps {
    value: any
    onChanged: () => void
}

function Input(props: InputProps) {
    return <input type="text" onChange={props.onChanged} value={props.value}/>
}
```

The `onChange` property, as every event handler, takes an event object as the only parameter. Let’s express it in our `InputProps` interface definition. `Event` is a name defined by the HTML spec itself, so let’s first try using it here:

```typescript
onChanged: (event: Event) => void
``` 

Unfortunately, this seems to be not the event we should care about:

![React does not use native HTML events](/images/react-ts/event-native.png)￼￼
￼
This rather verbose error gives us the expected type of an event, above anything else – see its last line. The event object passed by React is actually typed as `ChangeEvent<HTMLInputElement>` and this type seems not to extend the HTML built-in `Event` type. This is intentional because React doesn’t use the HTML events directly – it uses [Synthetic Events](https://reactjs.org/docs/events.html) wrappers instead.

When we change our `Event` type definition to the synthetic event type determined by both event type and element type, we are fine:

```typescript
onChanged: (event: React.ChangeEvent<HTMLInputElement>) => void
```

This gives us the best possible confidence level for what we can expect to get as an argument. It horribly reduces the flexibility, though. We can no longer have the same change handler for events fired on multiple types of HTML Elements (for example, `<input>` and `<select>`:

![Events on different HTML elements are not compatible](/images/react-ts/event-incompatible.png)￼￼￼

We got an error indicating near the end that `HTMLSelectElement` is not assignable to `HTMLInputElement`. Well, it is not, indeed, and our handler was defined to accept the former only and we’re unable to reuse that handler directly. A similar problem occurs if we want to attach the same handler to the events of multiple types (i.e. change, click, mouse interaction etc.) – `ChangeEvent<T>` and `MouseEvent<T>` are not compatible.

Fortunately, TypeScript provides a decent set of type system features that might help us here. First, we can use the common ancestor event type instead of the specific `ChangeEvent` – `SyntheticEvent` is a good fit. The generic parameter that describes the type of element we handle our event on is more troublesome. We might try with a `HTMLElement` base type and in some cases it will suffice. But my usual case for the generic event handling is to handle multiple form elements and access its value attributes. Apparently there is no common type for all form elements that defines the `value` attribute. We have at least two ways to work around it. First, the mercy of [union types](http://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) where we can specify an alternative of types we want to handle and its common attributes will be freely available: 

```typescript
onGenericEvent: (event: React.SyntheticEvent<HTMLSelectElement | HTMLInputElement>) => void
```

This is nice and explicit, although it doesn’t scale well if we want to handle more than few elements at once. The second solution uses the [structural type compatibility](https://basarat.gitbooks.io/typescript/docs/types/type-compatibility.html#structural) – yet another extremely neat TypeScript’s type system functionality that allows us to define and compare types by its structure only. If our case is to read a value of `value` attribute of the handled element’s only, we might state it explicitly in our handler type definition:

```typescript
onGenericEvent: (event: React.SyntheticEvent<{value: string}>) => void
``` 

The TypeScript’s type system allows us to choose which level of specificity vs. flexibility is appropriate in our case.

### Ugly case of generic `setState`

It’s not all flowers and roses, unfortunately. My typical scenario for form handling in React is to directly set the component’s state properties from the form elements values on their change events:

```html
<input type="text" name="firstName" 
       onChange={event => this.setState({firstName: event.currentTarget.value})} />
```

We might try to keep it generic by eliminating the duplication of the input’s name and assuming the name matches the key we want to set within the state and use [enhanced object literals](http://www.benmvp.com/learning-es6-enhanced-object-literals/) from ES6 specification (the thing with dynamic property names specified in square brackets):

```html
<input type="text" name="firstName" 
       onChange={event => this.setState({[event.currentTarget.name]: event.currentTarget.value})} />
```

As we have previously seen, TypeScript ensures the keys of the object we pass to `setState` match the actual properties of our component’s state. But here, TypeScript compiler (as of 2.6.1 at least) is not that smart to figure out what the actual value of event’s target `name` attribute would be, even though it can only be equal to `firstName` in this case. For TypeScript it is a general string and this is too wide to be considered valid for our `setState` call, unfortunately:

![TypeScript is unable to specify down setState parameter types](/images/react-ts/event-generic.png)￼￼￼

We may work around it with type cast to inform TypeScript compiler what is the range of values we might potentially expect from `event.currentTarget.name` (assuming `State` describes the state of our component). The `keyof State` construct informs the compiler that the strings there may only be those that are defined by `State` interface structure:

```
<input type="text" name="firstName" 
       onChange={e => this.setState({[e.currentTarget.name as keyof State]: e.currentTarget.value})}/>
```

Or, alternatively, if we want to avoid type casts, we may satisfy the `setState` call by ensuring the full state is always passed (including the expected modifications). It is actually taking advantage of a bit separate React’s feature than the partial state update, but should behave the same way:

```html
<input type="text" name="firstName" 
       onChange={e => this.setState({...this.state, [e.currentTarget.name]: e.currentTarget.value})}/>
```
 
Note I’m using not-yet-standard [object spread operator](https://github.com/tc39/proposal-object-rest-spread) here. It creates a copy of `this.state` and replaces (or adds) a single property to this copy – in this case it will set `firstName` property to the value of input’s `value` attribute, reflecting what the user has typed into the box.

## What’s more?

As you might have already noticed, all the HTML elements have its attributes mapped into `HTML*Element` types we can benefit from whenever we’re operating on the elements. Similarly, a good subset of the CSS properties are mapped into the `CSSProperties` interface that defines all the predefined values the particular CSS property might use. This might be useful to use if we use any form of the [inline styles](https://reactjs.org/docs/dom-elements.html#style) in our components. It would provide a proper code completion and in some cases ensure the validation of our CSS definitions:
￼
![TypeScript helps with CSS validity](/images/react-ts/css-properties.png)￼￼￼

I hope you already feel that TypeScript can offer a lot of benefits to your React codebase, even though we’ve just touched the iceberg tip. In the [next post](https://brightinventions.pl/blog/using-typescript-with-redux/) we'll add Redux into the mix and see how TypeScript can help us there, too.

