---
layout: post
title: 'Using AWS Cognito with NestJS'
date: 2020-01-04T20:05:28.083Z
image: /images/using-cognito-with-nest-js/amazon-cognito.png
author: patryk
tags:
  - aws
  - cognito
  - backend
  - nestjs
  - nodejs
hidden: false
comments: true
published: true
---

AWS Cognito simplified the authentication, authorization and user management for you. In this post I will try to present how we can use this authentication service with your mobile app, website, and manage users.

# Initial work #
To get started with AWS Cognito We need to create a user pool. The user pool is a container that AWS Cognito uses to manage and hold users identify.

![](/images/using-cognito-with-nest-js/user_pool_1.png)

We are going to start with Create User Pool. In my case I don’t have user pools, so I’m going to create one.

![](/images/using-cognito-with-nest-js/user_pool_2.png)

Here you are given two options to select from, let's select *Review defaults*. Make sure to provide a pool name as well.

Next, we need to create an app client. The app client is the client that our NestJS server will be communicating with. Make sure to tick Enable sign-in API for server-based authentication for our NodeJS server access Cognito user pool for authentication. App clients can be created after the generation of user pools as well. So, if you forget to add an app client when the creation of the user pool - do not worry, you can create a new one again.

Let's take a look at the overview of the settings, it should look like mine.

![](/images/using-cognito-with-nest-js/user_pool_overview.png)

# Creating TypeScript NestJS Server #

Ok, once we have completed the first part of the post which was creating a User Pool in Amazon Cognito, we can switch to creating the NestJS server which will use the Amazon Cognito user pool to authenticate users.

The easiest way to set up the environment is to run commands to initialize the Nest app and allow us to install the required packages.

I describe using npm to install packages, including the Nest CLI. Install the CLI globally using the `npm install -g` command (see the note above for details about global installs).

So, we are adding the Nest CLI package globally:

```text
npm install -g @nestjs/cli
```

To create, build and run a new basic Nest project in the development mode, go to the folder that should be the parent of your new project, and run the following commands:

```text
nest new simple-app
cd simple-app
npm run start:dev
```

In your browser open `http://localhost:3000` to see a new application running. The app will automatically recompile and reload when you change any of the source files.

# Implement authentication #

We are going to implement three functions in our NodeJS server application that authenticate the user:
* Sign in
* Sign up
* Token Validation (bonus, as an Authentication middleware)
For each function we will need separate API endpoints in our server as well. Let’s create an `auth.controller` to handle incoming requests.

For that purpose we are going to use *NestCLI* to generate the `auth.module`, `auth.controller` and `auth.service`.

```text
nest generate controller auth
nest generate module auth
nest generate service auth
```

The Nest CLI automatically will generate the auth folder with files and add it to the existing app module.

The next step is to add a package to help us reach the Cognito SDK which will be going to be used for requests to Cognito API

```npm install amazon-cognito-identity-js --save```

In `auth.service` we define the *CognitoUserPool* by giving generated `userPoolId`, `appClientId`. For safety reasons, it's good to store them in the config file. Then I've added the function for `register` and `authenticate`. 

```
import { AuthConfig } from './auth.config';
import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ICognitoUserPoolData,
} from 'amazon-cognito-identity-js';
import { AuthCredentialsDto, AuthRegisterDto } from './auth.interface';

const poolData: ICognitoUserPoolData = {
  UserPoolId: '{ userPoolId }',
  ClientId: '{clientId}',
};
const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  constructor(
    @Inject('AuthConfig')
    private readonly authConfig: AuthConfig,
  ) {
    this.userPool = new CognitoUserPool({ UserPoolId: this.authConfig.UserPoolId, ClientId: this.authConfig.ClientId });
  }

  get secretKey() {
    return this.authConfig.secretKey;
  }

  async register(authRegisterRequest: AuthRegisterDto) {
    const { name, email, password } = authRegisterRequest;
    return new Promise(((resolve, reject) => {
      return this.userPool.signUp(name, password, [new CognitoUserAttribute({ Name: 'email', Value: email })], null, (err, result) => {
        if (!result) {
          reject(err);
        } else {
          resolve(result.user);
        }
      });
    }));
  }

  async authenticateUser(user: AuthCredentialsDto) {
    const { name, password } = user;
    const authenticationDetails = new AuthenticationDetails({
      Username: name,
      Password: password,
    });
    const userData = {
      Username: name,
      Pool: userPool,
    };
    const newUser = new CognitoUser(userData);
    return new Promise(((resolve, reject) => {
      return newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: ((err) => {
          reject(err);
        }),
      });
    }));
  }
}
```

Let's now import the following function in our `auth.controller` which will receive the request and handle it.

```
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDto, AuthRegisterDto } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() AuthRegisterDto: AuthRegisterDto) {
    if (
      AuthRegisterDto.password.length < 8 ||
      !/[a-z]/.test(AuthRegisterDto.password) ||
      !/[A-Z]/.test(AuthRegisterDto.password) ||
      !/[0-9]/.test(AuthRegisterDto.password)
    ) {
      throw new BadRequestException('Password requirements not met.');
    }
    try {
      return await this.authService.register(AuthRegisterDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  @Post('authenticate')
  async authenticate(@Body() authenticateRequest: AuthCredentialsDto) {
    try {
      return await this.authService.authenticateUser(authenticateRequest);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
```

I have added two endpoints:
* register - API endpoint to register user
* authenticate - API endpoint to authenticate user 

###### Please note that in Cognito we add requirements according to which password should have at least 8 characters, in my example, I have added some validation at the controller level.

Our Dto's interface declaration looks like:

```
export interface AuthRegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthCredentialsDto {
  password: string;
  name: string;
}
```

## Bonus: Token Validation
For token validation we are going to use extra features from *NestJS*. For this purpose we are using *Guards*. 

We are going to start from install required packages:

```text
npm i --save @nestjs/jwt @nestjs/passport passport passport-jwt
```

Then we are going to create a file called `jwt.strategy.ts` and add the following code:

```
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClaimVerifyResult, handler } from './jwt.verify';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authService.secretKey,
    });
  }

  public async validate(
    payload: any,
    done: (err: Error | null, result: ClaimVerifyResult) => void,
  ) {
    const userInfo = await handler(payload);
    if (!userInfo) {
      return done(new UnauthorizedException(), null);
    }
    done(null, userInfo);
  }
}
```
The following code extend the *PassportStrategy* package and grab the *Baerer token* from the headers and pass it to the function `validate`. 

Our function `validate` uses the `handler` to decode the `jwt token`. The handler is the implementation of verifying *JWT Token* with Cognito.

```
import {promisify} from 'util';
import * as Axios from 'axios';
import * as jsonwebtoken from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userName: string;
  readonly clientId: string;
  readonly isValid: boolean;
  readonly error?: any;
}

interface TokenHeader {
  kid: string;
  alg: string;
}
interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}
interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const cognitoPoolId = '{cognitoPoolId}';
if (!cognitoPoolId) {
  throw new Error('env var required for cognito pool');
}
const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${cognitoPoolId}`;

let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await Axios.default.get<PublicKeys>(url);
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = {instance: current, pem};
      return agg;
    }, {} as MapOfKidToPublicKey);
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

const handler = async (request: ClaimVerifyRequest): Promise<ClaimVerifyResult> => {
  let result: ClaimVerifyResult;
  try {
    console.log(`user claim verfiy invoked for ${JSON.stringify(request)}`);
    const token = request.token;
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON) as TokenHeader;
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw new Error('claim made for unknown kid');
    }
    const claim = await verifyPromised(token, key.pem) as Claim;
    const currentSeconds = Math.floor( (new Date()).valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error('claim is expired or invalid');
    }
    if (claim.iss !== cognitoIssuer) {
      throw new Error('claim issuer is invalid');
    }
    if (claim.token_use !== 'access') {
      throw new Error('claim use is not access');
    }
    console.log(`claim confirmed for ${claim.username}`);
    result = {userName: claim.username, clientId: claim.client_id, isValid: true};
  } catch (error) {
    result = {userName: '', clientId: '', error, isValid: false};
  }
  return result;
};

export {handler};
``` 

In case you want to check the decoded jwt you can check [this](https://jwt.io/) out. More about verifying JWT in Cognito User Pool you can find [here.](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

When you want to use the *Authentication Guard*. Guards have a single responsibility. They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc.) present at run-time. This is often referred to as authorization. Authorization (and its cousin, authentication, with which it usually collaborates) has typically been handled by middleware in traditional Express applications. Middleware is a fine choice for authentication, since things like token validation and attaching properties to the request object are not strongly connected with a particular route context (and its metadata).

We need to use [AuthGuard](https://docs.nestjs.com/guards) and use Decorator *@UseGuards(AuthGuard)*. More about decorators you can find [here](https://docs.nestjs.com/custom-decorators).

## It’s showtime!

The above code is a minimalistic version for NestJS authentication using Cognito User Pools. Now it's time for doing some tests.

### 1. Register

I used *Postman* to send the request. In *@Body* I included email, password, name. A created successful response will contain:

![](/images/using-cognito-with-nest-js/register.png)

Then we can check also in our app in Cognito that the User has been created:

![](/images/using-cognito-with-nest-js/registered_cognito.png)

### 2. Authenticate
Again, in @Body I sent the required password and the user field. If I prepare the correct data, I will receive the user payload:

![](/images/using-cognito-with-nest-js/login.png)

### 3. Validation

For the test purposes I have added the *Guard* for the demo route. If I don't include the *Authorization* header with a token, the server will throw `UnauthorizedException` and in the client I will receive:

```
{
    "statusCode": 401,
    "error": "Unauthorized"
}
```

When we add in a proper format the token *Bearer {token}* the *Guard* which will determine that the token is valid or not, and will allow the route to handle the request.

## Summary

I think that more and more developers will use the IaaS (infrastructure as a service) and move logic outside the backend. What is great, in AWS you can also move all the logic with verifying the JWT to *LAMBDA* which can be triggered before sign-up and authentication (we can customize these workflows in the user pool settings).

Cognito is a great service from AWS. I'm using it always when I have an opportunity to do it.



