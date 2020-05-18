---
layout: post
title: HTTP request logging in Node.JS
excerpt: One of the most basic kind of logging every backend application should have is a trace logging of all incoming HTTP requests. Yet it's not easy to make it right and useful. Let me show you what we have learned and what we do to ensure our logs are meaningful and useful.
tags: [node.js, logging]
comments: true
author: adam
image: /images/node-logging.jpeg
---

One of the most basic kind of logging every backend application should have is a trace logging of all incoming HTTP requests. Yet it's not easy to make it right and useful. Most of the backends we create at Bright nowadays are Node.JS applications based on [Express](https://expressjs.com/). Although there is a [plethora of libraries](https://www.npmjs.com/search?q=logging) that are to handle logging for you, we would not be ourselves if we haven't tried to build something on our own (even if only for the sake of knowing the internals better). Let me show you what we have learned and what we do to ensure our logs are meaningful and useful.

## Log both requests and responses

The processing of an incoming HTTP request might consist of many tasks we want our backend to do including database queries, third party service calls and all kinds of data processing. By the nature of Node.JS, Express processes it asynchronously. The incoming data and the outgoing result of the HTTP request being processed are also decoupled in the Node's `http` module's code via the separation of [`ClientRequest`](https://nodejs.org/api/http.html#http_class_http_clientrequest) from [`ServerResponse`](https://nodejs.org/api/http.html#http_class_http_serverresponse) objects. 

These are the reasons we should always care about the beginning and the end of the processing pipeline separately and log both of them. In Express it's easy to use [middlewares](https://expressjs.com/en/guide/using-middleware.html) to stow into the beginning of the processing and execute our logging code there. Let's start with this simplistic approach, written in TypeScript:

```typescript
const logRequestStart = (req: Request, res: Response, next: NextFunction) => {
    console.info(`${req.method} ${req.originalUrl}`)
    next()
}

app.use(logRequestStart)
``` 

It's definitely missing a lot of general identification stuff to be useful, but it's a start. We're logging request's method (GET, POST etc.) and its [original URL](http://expressjs.com/en/api.html#req.originalUrl) - note that `req.url` might not necessarily keep the same value as it might be manipulated by our Express-based router.

![Node.JS logging](/images/node-logging.jpeg)

How about logging the other end of the processing pipeline? We have no generic way to attach a middleware to the end of processing and appending the `logRequestEnd` middleware manually at the end of each route definition would be very repetitive and cumbersome. But fortunately, `ServerResponse` is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) - it emits the events when it's finished and we can subscribe with our code there. Here is our updated code (TypeScript again):

```typescript
const logRequestStart = (req: Request, res: Response, next: NextFunction) => {
    console.info(`${req.method} ${req.originalUrl}`) 
    
    res.on('finish', () => {
        console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    })
    
    next()
}

app.use(logRequestStart)
```

Note we now attach a function as a subscriber to `finish` event emitted by our HTTP response object. It logs the status code and message (`200 OK`, `404 Not Found` etc.) and the length of the response body. Although it might be tempting initially to log the whole response data, it will normally be too long to be useful and might not be welcomed by our privacy savvy users if we keep their private data included in the responses in the plain text logs. And if we're only interested in the general outcome of our request, we should better communicate it [via HTTP status code](http://racksburg.com/choosing-an-http-status-code/), anyway.

## When the request is finished?

The code above has (at least) one problem. Not all the responses actually finish - when the request is aborted by the client or internal unhandled error is thrown, `ServerResponse` emits `close` and `error` events accordingly, instead, and we should also subscribe on them. The problem here is, though, we can't expect `res.statusCode` to be set properly in these cases. This itself is rather obvious, given the fact that the processing was abruptly interrupted for some reason. What is surprising, though, is that when we actually read it anyway, for example assuming that `statusCode` will be undefined or falsy, we get `200` (success status code) instead. This tricked us in the past because if we logged it as-is, while reading the logs afterwards we might overlook the fact that the request definitely wasn't that successful. I'd argue that this was a rather strange design decision of Node's `http` module creators to set the `statusCode` to 200 initially and let it be overwritten in case of unsuccessful responses - if the outcome is not yet known, it should not falsely indicate it is successful.

The TypeScript code that handles these cases correctly might look as follows:

```typescript
const getLoggerForStatusCode = (statusCode: number) => {
    if (statusCode >= 500) {
        return console.error.bind(console)
    }
    if (statusCode >= 400) {
        return console.warn.bind(console)
    }

    return console.log.bind(console)
}

const logRequestStart = (req: ApiRequest, res: Response, next: NextFunction) => {
    console.info(`${req.method} ${req.originalUrl}`) 
    
    const cleanup = () => {
        res.removeListener('finish', logFn)
        res.removeListener('close', abortFn)
        res.removeListener('error', errorFn)
    }

    const logFn = () => {
        cleanup()
        const logger = getLoggerForStatusCode(res.statusCode)
        logger(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    }

    const abortFn = () => {
        cleanup()
        console.warn('Request aborted by the client')
    }

    const errorFn = err => {
        cleanup()
        console.error(`Request pipeline error: ${err}`)
    }

    res.on('finish', logFn) // successful pipeline (regardless of its response)
    res.on('close', abortFn) // aborted pipeline
    res.on('error', errorFn) // pipeline internal error

    next()
}

app.use(logRequestStart)
```

Two more things to note here. 

First is that as both successful (2xx) and gracefully unsuccessful (4xx and handled 5xx) are going through the "ordinary" `finish` event route, I added the code to determine what the most correct console logger level to be used is. It has a little effect on the plain text logs output, but while looking at the terminal of the application running it dev, warnings and errors are colored red so they catch the attention more easily.

Second is the `cleanup` function that ensures no hanging listeners exist and regardless of which code path is taken, all the listeners are cleared and nothing prevents correct garbage collection.

## Correlate your requests with responses

We're doing well in logging both ends of our pipeline so far, but it's very far from usefulness if our request start logs are not at all correlated with response end logs. When we process many requests simultaneously, we have no way to figure out how long the request processing took or what the URL requested for an unsuccessful response was. Let's fix it by generating a transient identifier for the request being processed and ensuring it is included in all the log entries we create. 

We do it by running a middleware that adds our custom property to the request object and sets its value to the token generated by [`gen-uid`](https://www.npmjs.com/package/gen-uid) library although the way we generate the value is not important at all and you might use any other method that provides a value that is unique enough to distinguish a single particular request from another ones.

```typescript
import {token} from 'gen-uid'

req.requestId = token(true).substr(0, 8)
```

Then we just append this value every time something is logged. In the simplest case it might look like this:

```typescript
console.info(`[${req.requestId}] ${req.method} ${req.originalUrl}`) 
```

The example output of two overlapping requests now looks like this:

```text
[4e33fab09] GET /users?phrase=Adam
[8cc01bd69] GET /users?phrase=Jane
[4e33fab09] 200 OK; 235b sent
[8cc01bd69] 204 No Content; 0b sent

```

## Collect all the metadata

This starts to be useful, but still we're missing a lot. We don't know when the request happened and who our requester was. But we should be able to [read most of these from the request headers](/blog/8-steps-to-keep-your-api-sane/). The things we collect are: the client version, platform it is running on, user device identification and locale information and also a bits of app-specific user identification (ID, status, roles etc.) that we load based on the authentication token provided (or not provided) in the request. Here is the middleware code that sets up the metadata in the request object.

```typescript
interface RequestApiClient {
    version: string
    platformVersion: string
    device: string
    locale: string
}

interface ApiRequest extends Request {
    requestId: string
    apiClient: RequestApiClient
    user: ApiUser
}

const enhanceRequestWithMetadata = (req: ApiRequest, res: Response, next: NextFunction) => {
    req.requestId = token(true).substr(0, 8)

    req.apiClient = {
        version: req.get('X-ClientVersion'),
        platformVersion: req.get('X-ClientPlatformVersion'),
        device: req.get('X-ClientDevice'),
        locale: req.get('X-ClientLocale')
    }
    
    req.user = loadUser(req) // app-specific implementation

    next()
}
```

In order to remove the repetition while logging these things, let's introduce a wrapper for the Console API that automatically prepends all the messages with all the relevant metadata, always in the same way, to ensure our logs are both readable for humans and processable by the machines.

```typescript
export interface Logger {
    info(...args)
    log(...args)
    warn(...args)
    error(...args)
}

class LoggerImpl {
    private _req: ApiRequest
    private _requestImprint: string = ''

    constructor(req?: ApiRequest) {
        if (req) {
            this._req = req

            let imprintParts = [req.requestId]

            if (req.apiClient) {
                imprintParts.push(`${req.apiClient.device || ''} ${req.apiClient.platformVersion || ''}`)

                if (req.apiClient.version) {
                    imprintParts.push(`#${req.apiClient.version}`)
                }
                if (req.apiClient.locale) {
                    imprintParts.push(`${req.apiClient.locale} locale`)
                }
            }

            this._requestImprint = imprintParts.filter(x => !!x).join(', ')
        }
    }

    private get _userImprint() {
        return this._req && this._req.user ? ` ${(this._req.user.role || '').toLowerCase()} ${this._req.user.id}` : ''
    }

    private _log(level, ...args) {
        return console[level](new Date().toISOString(), level, `[${this._requestImprint},${this._userImprint}]`, ...args)
    }

    info(...args) {
        return this._log('info', ...args)
    }

    log(...args) {
        return this._log('log', ...args)
    }

    warn(...args) {
        return this._log('warn', ...args)
    }

    error(...args) {
        return this._log('error', ...args)
    }
}
```

Now, instead of using Console API directly, we instantiate a `Logger` instance, monkey-patch it into request object and use it throughout the processing pipeline (also for any regular log messages that happen inside of the pipeline that we do not cover here at all). This way, our logs look like this:

```text
2017-11-05T16:10:49.570Z info [350a7a0e, iPhone8,1 ios11.0.3, #622, de-de locale, no auth] GET /api/v1/user
2017-11-05T16:10:49.571Z info [6e79bd36, SM-G920F android7.0, #331, en-US locale, user 208ee38f-c636-4180-8dd4-dde48a04a4d1] GET /api/v1/entries
2017-11-05T16:10:49.704Z log [350a7a0e, iPhone8,1 ios11.0.3, #622, de-de locale, no auth] 401 Unauthorized; 0b sent
2017-11-05T16:10:50.351Z log [6e79bd36, SM-G920F android7.0, #331, en-US locale, user 208ee38f-c636-4180-8dd4-dde48a04a4d1] 200 OK; 4732b sent
```

Good enough!
