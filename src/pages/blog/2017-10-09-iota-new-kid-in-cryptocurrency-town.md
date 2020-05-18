---
layout: post
title: IOTA - a new kid in the cryptocurrency town
excerpt: At Bright Inventions, we always try to keep focus on the bleeding-edge technologies and innovations. We are especially interested in cryptocurrencies and its prospective wide usage in the industry, not only as a payment method. We already have some experience with Ethereum and Hyperledger as a Blockchain-based app platform, so we were curious what can IOTA offer.
tags: ['iota', 'blockchain', 'cryptocurrency']
comments: true
author: adam
---

At Bright Inventions, we always try to keep focus on the bleeding-edge technologies and innovations. We are especially interested in cryptocurrencies and its prospective wide usage in the industry, not only as a payment method. We already have some experience with [Ethereum](https://www.ethereum.org/) and [Hyperledger](https://www.hyperledger.org/) as a Blockchain-based app platform, so we were curious what can [IOTA](http://iota.org/) offer.

IOTA's marketing offerings are very prominent. It calls itself "a backbone of IoT" and promises scalability, decentralization, modularity and the lack of transactional fees. Its primary goal is to enable the "Economy of Things" - an environment in which the IoT devices might conduct secure, verifiable and reliable automated transactions for even the smallest amounts. It is not feasible with other cryptocurrency-based technologies because of the transaction fees that would be possibly larger than the amount exchanged.

## What IOTA is (or plans to be)?

First of all, [technically speaking](https://xkcd.com/1475/), contrary to Bitcoin, Ethereum or Hyperledger, it is not a [blockchain-based](https://en.wikipedia.org/wiki/Blockchain) solution, because transactions do not require blocks to be formed nor do they create a single chain of blocks. Instead, each transaction is a separate node in the tree-shaped graph of transactions. Every transaction references two earlier transactions that exist in the tree, confirming its validity (by verifying its [proof-of-work](https://en.wikipedia.org/wiki/Proof-of-work_system)). This directed tree-shaped graph in IOTA is called *the Tangle*.

![IOTA Tangle visualization by David Sonstebo](https://cdn-images-1.medium.com/max/2000/1*bMMGTt8UUIKoVGQCo6VL1g.png)

This way, at least theoretically, the whole system is self-validating and the approval process is decoupled from any authority and decentralized. It is also a way to [get rid of the transaction fees](https://learn.iota.org/faq/how-can-there-be-no-transaction-fees
) - all the nodes participating in the network have the incentive to verify proof-of-works of other transactions because it is required in order to submit own transactions to the network.

Scalability, the next major promise of IOTA, is theoretically guaranteed by the fact that it is not required for the node to know the state of the whole Tangle tree - the tree can grow asynchronously in many directions. The assumption is that the separate branches will be eventually "entangled" together and cross-validated by the future transactions. This idea allows nodes to work in a non-fully synced state - this is especially useful in the context of IoT devices that might encounter being offline for a myriad of reasons.

## The current state of affairs

Let's leave the marketing buzz from the landing page and check how all these promises work in today's reality. The project itself is quite young - the [initial commit](https://github.com/iotaledger/iri/commit/f52d16723c78502110dde4b9662676707174aa94) of the node implementation is not even a year old (Oct 2016). And while the project is really dynamic, it is still in the very early phase. If you count on any detailed reference or deep-dive instructions - you will be disappointed. All you can find is a [theoretical academic whitepaper](http://iota.org/IOTA_Whitepaper.pdf), coarse and partial [definitions of terms](https://iota.readme.io/v1.2.0/docs/glossary), [API reference](https://iota.readme.io/v1.2.0/reference) and a [vibrant Slack community](https://slack.iota.org/) that serves as an announcement board and the only way to have the node connected to the network. For all the rest you need to either dig through the source code or count on the community on Slack to help you.

It turns out that the other theoretical goals are also far from being met in practice.

### Decentralization

The pure IOTA Tangle is [vulnerable to the attack](https://medium.com/@ercwl/iota-is-centralized-6289246e7b4d
) that enables verification of invalid transactions by generating large enough sub-branch of the tree consisting of fake transactions so that the branch overweights the original, legitimate transactions branch, making it orphaned and leading to the approval of the double-spending transaction. 

As of October 2017, there is a [single designated node](https://blog.iota.org/the-transparency-compendium-26aa5bb8e260#dc3d) in the IOTA network, called Coordinator, that ensures the consistent state of the ledger, re-validating **all** the transactions and periodically generating a “Milestone mark” that is intended to indicate the “correct” branch of the Tangle tree. A Milestone is a special transaction, issued by the designated Coordinator node, which marks all the transactions it directly or indirectly approves as trusted.

The existence of Coordinator makes IOTA not fully decentralized by now and prevents from having a private ledger networks, because its address is hardcoded into the IRI (reference node implementation) and its source is not disclosed.

It is said that the existence of the Coordinator is a temporary measure, until the protocol stabilizes and the network gets a certain size making it unfeasible to take over, but no due date is given.

### IoT app platform

The idea of the IOTA system is to be possible to run it directly on IoT devices. It is [not](https://www.reddit.com/r/Iota/comments/6suctt/iota_on_raspberry_pi/) [yet](https://www.reddit.com/r/Iota/comments/6fhjvw/full_node_on_raspberry_pi/) possible to run the full node on Raspberry Pi, though. However, it should be possible to run the thin client that connects to the external node.

What is important, IOTA cannot serve as an app platform as long as there's no [Smart Contract](https://www.reddit.com/r/Iota/comments/70fpew/smart_contracts_in_iota/) functionality there. It is planned, but it doesn't seem to be reasonable to expect it soon.

## What next?

Even if the number of TODO's on the IOTA team's list is long, there are definitely some parts that can be used even today. 

[Next time](/blog/getting-started-with-iota), we'll look into the ways we can interact with the Tangle, even in its current state of maturity.
