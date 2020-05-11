---
layout: post
title: Using TypeScript with Redux
excerpt: Let's follow the typical path the front-end project takes nowadays and add Redux into our React+TypeScript application. TypeScript is a powerful beast that we can employ to make our Redux code not only type safe, but also much cleaner and more readable.
tags: [React, TypeScript, web]
comments: true
author: adam
image: /images/react-ts/redux-ts.png
---

Recently we've checked [what benefits TypeScript adds in our React project](https://brightinventions.pl/blog/5-ways-to-benefit-from-typescript-in-react/). Let's now follow the typical path the front-end project takes nowadays and add [Redux](https://brightinventions.pl/blog/from-react-to-react-redux-in-a-few-steps/) into the mix. Unfortunately, by default Redux is not really type safe as it is in most cases presented as [switches over actions with arbitrary payloads](https://redux.js.org/introduction/core-concepts). But TypeScript is a powerful beast and with a bit of care we can make our Redux code not only type safe, but also much cleaner and more readable.

![Redux + TypeScript](/images/react-ts/redux-ts.png){: .center-image}

## Basic typing

Let's dissect the classical To Do list example from the "[Core Concepts](https://redux.js.org/introduction/core-concepts)" introductory Redux guide's page step-by-step. The global app's state originally looks as follows:

```javascript
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

It is pretty straightforward to create a type definition for this state:

```typescript
interface Todo {
    text: string
    completed: boolean
}

type VisibilityFilter = 'SHOW_COMPLETED' | 'SHOW_ALL'

interface AppState {
    todos?: Todo[]
    visibilityFilter?: VisibilityFilter
}
```

Note that `AppState`'s properties are optional as the state might initially be empty and we need to handle it in our code and thus reflect it in our type definition.

So far so good. Now Actions – they initially look like this:
                    
```javascript
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

Let's for now use the typing provided by [`redux` library itself](https://github.com/reactjs/redux/blob/master/.d.ts), specifically `AnyAction` that only enforces the `type` property to be set:

```typescript
const actions: AnyAction[] = [
    { type: 'ADD_TODO', text: 'Go to swimming pool' },
    { type: 'TOGGLE_TODO', index: 1 },
    { type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
]
```

Better than nothing, we can't have an Action without a type at least and we can put arbitrary data into it.

Now let me jump to Reducers. Reducers in the original example are implemented this way:

```javascript
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}
​
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map(
        (todo, index) =>
          action.index === index
            ? { text: todo.text, completed: !todo.completed }
            : todo
      )
    default:
      return state
  }
}

// top-level reducer
function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  }
}
```

Let's use our State and Action type definitions as a first step:

```typescript
function visibilityFilter(state: VisibilityFilter = 'SHOW_ALL', action: AnyAction): VisibilityFilter {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}
​
function todos(state: Todo[] = [], action: AnyAction): Todo[] {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map(
        (todo, index) =>
          action.index === index
            ? { text: todo.text, completed: !todo.completed }
            : todo
      )
    default:
      return state
  }
}

// top-level reducer
function todoApp(state: AppState = {}, action: AnyAction): AppState {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  }
}
```

Note that all reducers, regardless of on which level they exist, share the same generic signature:

```typescript
type Reducer<S> = (state: S, action: AnyAction) => S;
```

This is exactly the type that the built-in Redux typings provide, so we can use it in our code directly if we have an urge to generalize it more for some reason.

## Can we do more?

All we have done so far was to add the basic type definitions that could prevent us from a set of typos. But looking at the reducers, we're far from an actual type safety as `AnyAction`-typed actions – as this `any` in the name suggests – does not give the TypeScript compiler any clue what payload the particular action type actually carries. We might still make a typo while accessing action's payload properties, assume its wrong type or use the properties of action of another type by mistake and TypeScript has no tool to warn us in this case:

```typescript
function visibilityFilter(state: VisibilityFilter = 'SHOW_ALL', action: AnyAction): VisibilityFilter {
    if (action.type === 'SET_VISIBILITY_FILTER') {
        return action.fliter // note the typo here. TypeScript is unable to detect the problem here
    } else {
        return state
    }
}
```

But all hope is not lost yet. TypeScript has a powerful feature of [Discriminated Unions](https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html) and even though this name sounds like some kind of organization of a social minority, it might help us a lot here.

Let's create detailed type definitions for each kind of action we support:

```typescript
interface AddTodoAction extends Action {
    type: 'ADD_TODO'
    text: string
}

interface ToggleTodoAction extends Action {
    type: 'TOGGLE_TODO'
    index: number
}

interface SetVisibilityFilterAction extends Action {
    type: 'SET_VISIBILITY_FILTER'
    filter: VisibilityFilter
}
```

Note that we extend Redux-provided `Action` now which only specifies a `type` property. `AnyAction` type we used before permits any property to exist in its implementations, so it defeats our desired type safety. Another interesting bit here is that we specify the `type` property with a literal, making it a good candidate for the discriminator of our discriminated union. Here is the union itself:

```typescript
type TodoAppAction = AddTodoAction | ToggleTodoAction | SetVisibilityFilterAction
```

Now let's replace `AnyAction` in our reducers with `TodoAppAction` and let's see what happens now:

```typescript
function visibilityFilter(state: VisibilityFilter = 'SHOW_ALL', action: TodoAppAction): VisibilityFilter {
    if (action.type === 'SET_VISIBILITY_FILTER') {
        return action.filter
    } else {
        return state
    }
}
​
function todos(state: Todo[] = [], action: TodoAppAction): Todo[] {
    switch (action.type) {
        case 'ADD_TODO':
            return state.concat([{text: action.text, completed: false}])
        case 'TOGGLE_TODO':
            return state.map(
                (todo, index) =>
                    action.index === index
                        ? {text: todo.text, completed: !todo.completed}
                        : todo
            )
        default:
            return state
    }
}

function todoApp(state: AppState = {}, action: TodoAppAction): AppState {
    return {
        todos: todos(state.todos, action),
        visibilityFilter: visibilityFilter(state.visibilityFilter, action)
    }
}
```

If you use a TypeScript-aware IDE (like [WebStorm](https://www.jetbrains.com/webstorm/), for example), you might notice that the action properties are now properly colored and the code completion works exactly as we might have dreamt. Let's now try our typo example again:

![TypeScript properly checks Action payload types](/images/react-ts/reducer-typo.png){: .center-image}

A victory for humanity, isn't it?

## Connected Components

One more place we might feel betrayed by Redux is where it actually [binds into React components](https://redux.js.org/basics/usage-with-react). Let's use a bit simplified example from the Redux guide again:

```jsx
import { connect } from 'react-redux'
import { setVisibilityFilter } from '../actions'

// the component itself

const Link = ({active, children, onClick}) => {
  if (active) {
    return <span>{children}</span>
  }
​
  return <a href="" onClick={onClick}>
    {children}
  </a>
}
​
// redux binding

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}
​
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}
​
const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link)
```

Let's define the types for the `Link` component's props in the straightforward way:

```typescript
interface LinkProps {
    active: boolean
    onClick: () => void
}

const Link: React.StatelessComponent<LinkProps> = props => {
  if (props.active) {
    return <span>{props.children}</span>
  }
​
  return <a href="" onClick={props.onClick}>
      {props.children}
  </a>
}
```

This works fine, but this way we can't go further into `mapStateToProps` or `mapDispatchToProps` as these methods compose our final props object from independent parts and we either leave it untyped or describe it with some kind of workarounds like `Partial<LinkProps>` to at least give us the basic checks:

![Workaround on mapStateToProps might help a bit](/images/react-ts/mapprops-partial-typo.png){: .center-image}

Note we don't have a proper type for `ownProps` here, too, and "for convenience" we used `any`. Also, this approach let us return `onClick` property here which we clearly expect to be returned only from `mapDispatchToProps` in this case. Let's be explicit about it and split our props into three separate types: one for own props (passed from the parent component), one for state-based props and one for dispatch-based props:

```typescript
interface LinkOwnProps {
    filter: VisibilityFilter
}

interface LinkStateProps {
    active: boolean
}

interface LinkDispatchProps {
    onClick: () => void
}

type LinkProps = LinkOwnProps & LinkStateProps & LinkDispatchProps
```

And now our Redux bindings are fully type safe:

```typescript
const mapStateToProps = (state: AppState, ownProps: LinkOwnProps): LinkStateProps => {
    return {
        active: ownProps.filter === state.visibilityFilter
    }
}

const mapDispatchToProps = (dispatch: Dispatch<AppState>, ownProps: LinkOwnProps): LinkDispatchProps => {
    return {
        onClick: () => {
            dispatch(setVisibilityFilter(ownProps.filter))
        }
    }
}
```

For me the type safety given by proper TypeScript definitions made Redux great again. How about you?
