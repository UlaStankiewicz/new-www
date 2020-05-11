---
layout: post
title: I am hooked on React
image: /images/I-am-hooked-on-react/intro.jpg
author: patryk
hidden: false
tags: [React, JavaScript, Hooks] 
---

React has introduced a new feature which allows you to use state and other React feature without writing class, upcoming [Hooks](https://reactjs.org/docs/hooks-overview.html), a new proposal in React 16.8.0, which are going to blow your socks off and enable our stateless function component does more than even before!

![](/images/I-am-hooked-on-react/intro.jpg){: .center-image}

# Initial work #

The easiest way to setup environment for learning React with Hooks is run:

```
npx create-react-app my-app
cd my-app
npm start
```

Now, we have initialized React application.
Please, make sure that to use the React-Hooks you have installed proper version (the version which I will use is `16.8.0`) for today it’s the newest version of React.

If you want to know, which version you are using, please use the command: 

```npm info react```

In case you want to update your react and react-dom please use the command: 

```npm i react@next react-dom@next```

# React Hooks #

In this post we are going to focus on 3 basic Hooks in React:

```
useState
useEffect
useContext
```

React has introduced even more, but the following features are more complicated and should be described separately:

```
useReducer
useCallback
useMemo
useRef
useImperativeMethods
useLayoutEffect
```


### useState

Now, you can add state to a functional component. We don't need to write a separate class for that.
Let's create a simple counter state-less component and add first Hook.

```jsx
export const Counter = () => {
   return (
       <div>
           <p>Counter value: </p>
           <button onClick={}>Increase</button>
           <button onClick={}>Decrease</button>
       </div>
   )
}
```

It's the simple Counter. Our counter will increase and decrease the value if user presses Button `onClick` event.

The way it works, you can pass the initial state as a first argument, in my case it will be count equal 0. 
```
const [count, setCount] = useState(0);
```
The `useState` Hook returns an array. The first entry of the array is the the current value of the state, at this point it will be 0. The second entry of the array is a function to update the state.

Now, we can pass the current value of the state and function for update the state:

```jsx
export const Counter = () => {
   const [count, setCount] = useState(0);
   return (
       <div>
           <p>Counter value: {count}</p>
           <button onClick={() => {setCount(count + 1)}}>Increase counter</button>
           <button onClick={() => {setCount(count -1)}}>Decrease counter</button>
       </div>
   )
}
```


### useEffect

Hook as ability to avoid the side effects from the function component. It is almost the same like well-known `componentDidMount` and `componentDidUpdate`.

So, simply we wll import and add it to our Counter, and pass an anonymous function as a first argument:

```jsx
const [count, setCount] = useState(0);
const [checked, changeCheckbox] = useState(true)
useEffect(() => {
   console.log('hello from useEffect')
})
```

For now, the text `hello from useEffect` will render every time when we change the current value of checkbox (so every time when function flushes changes to the DOM including the first render). 

The real power of `useEffect` is that we can pass a second optional argument, which is an array. Then we can specify that we want to invoke this effect only in the situation when we change the count value.

```jsx
useEffect(() => {
   console.log('hello from useEffect')
}, [count])
```

Now, the `useEffect` **will be called only in case that the state of the count will change**. Cool, right?

### useContext

Imagine, the problem is that the name and surname of user from an index file is passed down as a prop to the components. 

We are going to create two additional function components: `Header` and `LoginInfo`. The components will only render the value passed as a `prop` from the `Dashboard`.

`Dashboard` which actually does not use it, just passed it down to `Header` which uses the value from the user state and passes it as well to `LoginInfo` which also renders the name of the user.
This approach is ok, but we have to pass a user through a bunch of components (in our case `Dashboard` which doesn't care about it). 

One way to make it looks better is to use `createContext`, to create a new context and returns the current context value, as given by the nearest context provider for the given context. 
So let's create and export the `Context` object:

```jsx
import React from 'react'
const Context = React.createContext()
export default Context
```

In our index app, we are importing the Context and wrap the whole main page component with `<Context.Provider>` and pass the user value from state as a prop. Now, we have an access to all of the 
Context consumers to the value from state and we don’t need to pass it through the components as a prop.

```jsx
import React, { Component } from 'react';
import './App.css';
import { Dashboard } from "./Dashboard";
import Context from './Context'

class App extends Component {
   state = {
       user: 'John Doe'
   }
   render() {
       const {user} = this.state
       return (
           <Context.Provider value={user}>
               <Dashboard />
           </Context.Provider>
       );
   }
}
export default App;
```
Right now, we use `useContext` Hook and wrap our Context, where the value is a value passed from the Provider (our index). Let's assign in to user variable.
```jsx
import React, { useContext } from 'react'
import LoginInfo from './LoginInfo'
import Context from './Context'

const Header = () => {
    const user = useContext(Context)
    return (
        <div>
            <h1>Welcome {user}</h1>
            <LoginInfo />
        </div>

    )
}

export default Header
```
The situation will be the same for the `LoginInfo`. We declare a value `user` by using `useContext` Hook and the value is a value passed from the Provider (our index).
```jsx
import React, { useContext } from 'react'
import Context from './Context'

const LoginInfo = () => {
    const user = useContext(Context)
    return (
        <h6>Logged as {user}</h6>
    )
}

export default LoginInfo
```

In `LoginInfo` and `Header` now we have prop user as a value, so we can remove the unnecessary prop from the `Dashboard` which doesn't use it at all. 


# React Hooks restrictions #

Although it looks nicely, it's really good to know about Hooks:
* Hooks can be only called from React function component,
* Hooks should be only called on the top level. Don't call them inside loops, conditions or nested functions. By following this rule, you ensure that Hooks are called in the same order each time as component renders. That's what allows React to correctly preserve the state of Hooks between multiple `useState` and `useEffect` calls. (For more if you are curious, good explain is [here](https://reactjs.org/docs/hooks-rules.html#explanation)).

# Class base component will be no more support? #

I think that Hooks and class base components will be still useful. The documentation says that **"There are no plans to remove classes from React"** and they definitely do not recommend rewriting everything into Hooks. It's individual and you should decide whether use Hooks or Classes.

Hooks are great feature in React. Personally, I'm using it after stable version release.
