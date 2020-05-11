---
layout: post
title: How to deploy smart contract
author: daniel
hidden: true
tags: [smartcontract, ethereum, deploy, web3js, parity]
---

# Deploying smart contracts

I would like to describe three different ways of deploying Smart Contracts. The first one and the very basic one is

### Via web interface

When you open parity UI you need first enable Contracts tab in Settings tab (it's disabled by default). If you open Settings you should see:
![Enable contracts tab on Parity UI](/images/smart-contract-create-test-and-deploy/enable-contracts-feature-on-parity-ui.png)

please check 

![] 


### Via web3-js

```javascript
const Web3 = require('web3');

const nodeURL = "http://localhost:8540";
const bytecode = "..."; //todo
const abi = [{}]; //todo
const contractOwnerAddress = "0x001a88dfd34c33b8i89a98al8766aa665c81d191"; //todo

var web3 = new Web3(new Web3.providers.HttpProvider(nodeURL));
var contract = web3.eth.contract(abi);
var params = {from: contractOwnerAddress, gas: 2310334, data: bytecode}

var contractInstance = contract.new(params)
console.log(contractInstance.address)
```


before contract.new(params) please unlock an account
``` 
curl --data '{"method":"personal_unlockAccount","params":["0xXX","your password",null],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8540
```


### Deploy via transaction


```typescript

import {Api} from '@parity/parity.js'

const bytecode = ''; //todo
const contractOwnerAddress = '0x13123123123todo'; //todo
const contractOwnerPassword = 'somesecretpassword'; //todo
const gas = '0x199901' //todo
const transport = new Api.Transport.Http(parityUrl)

let hash = await transport.execute('personal_sendTransaction', {
    from: contractOwnerAddress,
    data: bytecode,
    gas: gas
}, contractOwnerPassword)
```
