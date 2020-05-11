---
layout: post
title: Getting started with IOTA
excerpt: Although the plans of IOTA are great, currently the project is in its incubation phase, with the majority of the most attractive features not yet ready to use. But this shouldn't stop us from playing with what we already have today. Let's play!
tags: [IOTA, blockchain, cryptocurrency]
comments: true
author: adam
---

In the [previous post](/blog/iota-new-kid-in-cryptocurrency-town/) we took a first glance at [IOTA](http://iota.org/) ledger. Although the plans are great, currently the project is in its incubation phase, with the majority of the most attractive features not yet ready to use. But this shouldn't stop us from playing with what we already have today.

Before we dig into the code, we need to get connected to one of the two IOTA networks. The "proper" network is called `mainnet` and there is also a [slightly more relaxed one](https://blog.iota.org/the-iota-testnet-training-wheels-for-the-community-fd65dbdddb3b) called `testnet`. As the names suggest, the latter is for test purposes. Each network consists of the multiple nodes that are run by the community. In order to join the network, we either need to run our own node or to connect to the existing node using its public API. 

## Is node a node?

If we're tech savvy enough and we have decided to become an active part of the IOTA network, we need to have our node up and running. IOTA's terminology avoids using "node" name for what they offer now. The only software that is able to run as a part of the network is called "IOTA Reference Implementation" (IRI) - my guess is that it is intended to suggest clearly that the project is still in its infancy and everything might change over time.

IRI is written in Java and is [publicly available on GitHub](https://github.com/iotaledger/iri) as [GPL-licenced](https://github.com/iotaledger/iri/blob/dev/LICENSE) open source. Requiring a full Java JRE to run a node is probably one of the reasons IOTA is not yet feasible for real IoT usage. We can choose to run it either from a [JAR file provided](https://github.com/iotaledger/iri/releases) or - which sounds more appealing to me - using [Docker image](https://hub.docker.com/r/iotaledger/iri/).


## Let's roll

To build and run the Docker image, type the following:

```
docker run -d --name iota-node \
  -p 14265:14265 -p 14777:14777/udp -p 15777:15777 \
  -v ~/iota.ini:/iri/iota.ini iotaledger/iri:v1.4.0
```

We're creating a container named `iota-node` for an easy future access. With `-p` options we're exposing three custom network ports for external communication. And with `-v` we're passing a path to our node's configuration file that should look as follows:

```
[IRI]
PORT = 14265
UDP_RECEIVER_PORT = 14777
TCP_RECEIVER_PORT = 15777
NEIGHBORS = [space-separated list of neighbors]
IXI_DIR = ixi
HEADLESS = true
DEBUG = true
DB_PATH = mainnetdb
```

Here we have the communication ports specified again. They deserve an explanation as its purposes and usage are not obvious and the official docs are not helpful.

The first one - named cryptically `PORT` - is used to expose our node's HTTP API. It is useful to configure, orchestrate and monitor our node, but it should not necessarily be exposed to the public internet. We should leave it available from inside the Docker container just for us, but it is not necessary to expose it on our external firewall.

`UDP_RECEIVER_PORT` and `TCP_RECEIVER_PORT` are ports that need to be exposed via the firewall - so ensure your router or ISP allows you to configure public traffic over these ports to reach your node. IRI uses UDP by default with TCP fallback - technically, only one of these channels need to be reachable. UDP adds less overhead but TCP in some cases is easier to set up and debug.

## Get along with your neighbors

We now have a stranded process running in the void. It's time to find other nodes we can connect to and sync the state of the Tangle with it. These other nodes are called "neighbors" and we need to maintain a two-way channel between us and our neighbors. As of today, the only way to get some neighbors is to ask the friendly people on **#nodesharing** [IOTA's Slack channel](https://slack.iota.org/) for a way in. When asked during the European's daytime, I got some responses in less than an hour.

![IOTA neighborhood](/images/iota/neighborhood.jpg)

When you're already befriended with other nodes owners, you need to give them the publicly available address of your host - most probably looking like `udp://12.23.34.45:14777`. Note we're specifying the UDP protocol here and using a corresponding receiver port from our INI file. Our neighbors should give us their addresses, also for UDP protocol (if we decide to use UDP, that is - for TCP, both sides should use TCP protocol and ports, obviously).

To add a neighbor, include its address in your `iota.ini` file, in `NEIGHBORS` field, as a space-separated list and restart your node. Alternatively, you can use your node's [HTTP API method](https://iota.readme.io/v1.2.0/reference) to add a neighbor dynamically.

After this is done, try calling [`getNeighbors`](https://iota.readme.io/v1.2.0/reference#getneighborsactivity) to see what's going on. If everything goes right, the number of all transactions should grow pretty quickly. Now just go for a long lunch (possibly including a dinner) and when you're back, you'll be in sync with the network, being a part of IOTA ecosystem. Hooray!

## Light Node

There is also the wallet client app (also called "light node"), but its use is restricted to token trading. It requires a connection to the existing node's HTTP API (this one exposed via port defined in `PORT` - 14265 in my example). But we're geeks, we care about tech stuff more than about trading 🤓.

Speaking of the node's HTTP API again. If it's there, we might also use it directly on our own, right? Sure we can. Stay tuned for [the next post in the series](/blog/iota-hello-world/) where we'll submit a Hello World transaction to IOTA from a Node.JS application.
