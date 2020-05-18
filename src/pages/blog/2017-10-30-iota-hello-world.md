---
layout: post
title: IOTA - Hello World
excerpt: The most mature client library we can use for IOTA is a JavaScript one called iota.lib.js. Let's see what we can use it for.
tags: [IOTA, blockchain, cryptocurrency]
comments: true
author: adam
image: /images/iota/attach-tangle.jpg
---

Previously in the IOTA series we've looked into [the assumptions of this promising cryptocurrency system](/blog/iota-new-kid-in-cryptocurrency-town/) and we've [connected to the network with our own node](/blog/getting-started-with-iota/). It's high time to interact with IOTA programatically.

IOTA nodes (or, actually, as the creators of the system prefer to call it - IOTA Reference Implementations) expose an HTTP API that we can interact with and - unlike most of the IOTA's ecosystem - has an [actual documentation](https://iota.readme.io/v1.2.0/reference) available. But while it is indispensable to look into this reference, we'll rather use the client libraries to talk to our node. 

There are [three official client libraries](https://iota.readme.io/docs/overview) out there at the moment and the most mature one is apparently the one we'd like to use - a JavaScript one called [iota.lib.js](https://github.com/iotaledger/iota.lib.js). It is basically a wrapper for the API endpoints.

## Talking to node using Node

Let's start with the empty Node.JS project that we can bootstrap using `npm init`. Then install IOTA's library with `npm install iota.lib.js --save` and jump into the code.

To establish a connection, we need to specify where is our IRI, including the public API port (specified as `PORT` in the node's config file or as `-p` if passed from command line). Note that by default we don't need any credentials here - that's why it is important to keep our node's API port hidden from the external network or configured properly with `--remote-auth` and `--remote-limit-api	` [configuration options](https://iota.readme.io/v1.2.0/docs/install-iri) to avoid everyone to mess with our beloved node.

```javascript
const IOTA = require('iota.lib.js')
const iota = new IOTA({
    host: 'http://192.168.1.162',
    port: 14265
})
```

Now let's see what our node tells us about itself using [`getNodeInfo`](https://iota.readme.io/v1.2.0/reference#getnodeinfo) call. All the API calls adhere to the clumsy Node.JS [callback passing convention](https://www.joyent.com/node-js/production/design/errors):

```javascript
iota.api.getNodeInfo((error, nodeInfo) => {
    if (error) {
        console.error('getNodeInfo error', error)
    } else {
        console.log('getNodeInfo result', nodeInfo)
    }
}
```

What we'll get in return, apart from the node's version and footprint information, is the processing state - whether there are any pending transactions to transmit and what is the latest milestone known to our node. This latter value should change every several minutes if our node is in sync with the network.

## Where's my wallet?

Addresses in IOTA can be understood as distinct wallets that can store IOTA tokens. These are long enough strings, so that it's totally fine to generate it on your own and - in practice - be sure about its uniqueness. 

In order to claim the ownership of a given address, we need to have the seed it was generated from - think of the seed as a private key to your box with wallets. The seed [needs to be generated securely](https://iotasupport.com/gui-newseed.shtml), probably not using the public websites that does it for you. The easiest would probably be to use macOS/Linux terminal and run:
 
```
cat /dev/urandom | LC_ALL=C tr -dc 'A-Z9' | fold -w 81 | head -n 1
```

Now, the thing we got back, looking similar to `FNCWNXJWJIVDGPRWNZYKOMKNIIATPPDKEVCZEWSZTEVIWJFCOUV9PJD9AUCEVQLFEAI9UBUAVQKVEBLKN`, is our seed. We're responsible for storing it securely and privately because it gives a full access to all the addresses (wallets) we'll create using it.

To actually generate the address we can use to send transactions to, let's use our API:

```javascript
const seed = 'FNCWNXJWJIVDGPRWNZYKOMKNIIATPPDKEVCZEWSZTEVIWJFCOUV9PJD9AUCEVQLFEAI9UBUAVQKVEBLKN' // keep it secure!
iota.api.getNewAddress(seed, (error, address) => {
   if (error) {
       console.error('getNewAddress error', error)
   } else {
       console.log('new address generated: ' + address)
   }
})
```

## Spending the tokens

We're now ready to submit our first transaction, or - how the API calls it - the transfer. Apart from the monetary value (which can be zero), we can attach a message to our transaction. The message needs to be [tryte-encoded](https://learn.iota.org/faq/trytes-and-trits) - we don't need to care much about it fortunately as we have a helper method for this task: [`iota.utils.toTrytes`](https://github.com/iotaledger/iota.lib.js#totrytes).

The code to send our transaction to the IOTA's tangle is as follows:

```javascript
const Depth = 3 // constant defined by IOTA - how deep to look for the tips in the Tangle
const MinWeightMagnitude = 16 // constant defined by IOTA - the difficulty of PoW

const transfers = [
    {
        // where are we sending the transaction to?
        address: 'CHNLHJCYBZCYUI9DTHINDDWHNJWFCHQOTGABXFVZQHXF9BROTOIJZJSBXOVKCDGCXZTDDJUVTYBJZYAOH',
        
        // how many tokens are we transferring?
        value: 42,
        
        // do we want to comment on this transaction?
        message: iota.utils.toTrytes('Hello World!')        
    }
]

const options = {
    // addresses of the wallets we're using to fund this transfer
    inputs: ['ZISNLNSKMPDOORSSFRCBGQOPY9BI9SONMTDHJJDWBTTCYLFV9PQ9VSWNI9FHEAEFGROGZ9YHSMZYOGFQG']
}

iota.api.sendTransfer(seed, Depth, MinWeightMagnitude, transfers, options, (error, transactions) => {
  if (error) {
     console.error('sendTransfer error', error)
  } else {
     console.log('transactions sent!', transactions)
  }
})
```

We need to specify where we send our tokens with message to and which of (our) wallets the tokens come from (if we're sending non-zero value). In the response, we get a `transaction` object for each `transfer` object we've submitted. 

![Attaching to the IOTA's Tangle](/images/iota/attach-tangle.jpg)

If we're lucky, we should be able to get the transaction's `hash` property, paste it at one of [the online Tangle viewers](https://thetangle.org) and see the details of our transaction. It will be most probably in the "Pending" state. This means the transaction was properly attached to the Tangle, although it wasn't yet validated by other transactions in the Tangle tree and we need to wait a bit. Normally it gets into "Confirmed" state within a few minutes and we can call it a day.

But we might be not that lucky and our transaction might get attached to the part of the tree that will never be validated, either because there were too many tips in the Tangle tree waiting for validation so that it gets "forgotten" by the tip selection algorithm (the tip selection algorithm is biased towards the transactions from the top of the tree) or it happened to get attached to the subtree that yielded incorrect. 

In these cases our transaction never goes away from the "Pending" state and we need to fix the problem by "reattaching" our transfers (called "bundle") to another part of the Tangle tree. In order to do so, we can periodically run the code that might look like:

```javascript
iota.api.getLatestInclusion([hash], (error, inclusionStates) => {
  if (error) {
     console.error('getLatestInclusion error', error)
  } else if (inclusionStates[0]) {
     console.log('transaction is included (confirmed)! yay!') 
  } else {
     iota.api.replayBundle(hash, Depth, MinWeightMagnitude, (error, replayTransactions) => {
         // ad infinitum...?
     })
  }
})
```

This procedure might look strange, as we're actually adding more and more duplicates to the Tangle - replay transaction is a separate transaction. We now probably need to track the "inclusion state" (status) of both the original and the replay transaction. We also need to replay it once again in case it doesn't get validated within a few minutes. All this comes with the cost of issuing a new transaction, but this is actually beneficial to the IOTA network as a whole because by doing this we're confirming another pair of transactions. And there are double-spending validation schemes implemented that ensures only one of the transactions will be finally confirmed.


