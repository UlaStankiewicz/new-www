---
layout: post
title: P2P in Hyperledger Fabric
date: 2020-02-14T15:21:07.486Z
image: /images/tomek-p2p-in-hyperledger.png
author: tomek
tags:
  - blockchain
  - grpc
  - hyperledger
  - blog
hidden: false
comments: true
published: true
---

Due to the modular and plug-and-play architecture hyperledger fabric implements a peer-to-peer protocol based on **gRPC and proto buffers** which allows for bi-directional stream-based messaging. We will examine the individual elements of the protocol and the examples of messages sent in the Hyperlegder network.

## gRPC basics ##

**gRPC** is an alternative to **REST** and other RPC frameworks, based on HTTPS 2.0 which is faster and has improved security features over HTTPS 1.1.

Like many RPC systems, **gRPC** is based on the idea of defining a service and specifying the methods that can be called remotely. In **gRPC** a client application can directly call methods on a server application on a different machine as if it was a local object, making it easier for you to create distributed applications and services.

```bash
service HelloService {
  rpc SayHello (HelloRequest) returns (HelloResponse);
}

message HelloRequest {
  string greeting = 1;
}

message HelloResponse {
  string reply = 1;
}
```

On the server side, the server implements interface and runs a **gRPC** server to handle the client calls. On the client side, the client has a stub (referred to as just a client in some languages) that provides the same methods as the server.

![Grpc graph](/images/p2p-in-hyperledger-fabric/grcp-graph.png)

Due to the fact that **gRCP** uses **proto buffers**, the server may be written in a different language than the client (for now it supports 10 programming languages).

## Proto buffers ##

**Protocol buffers** are Google's language-neutral, platform-neutral, extensible mechanisms for serialising structured data.

To better understand how proto buffers work, let's compare it with **JSON**:

```bash
{"name":"Peter","lastName":"Jason"}
```

This **JSON** object contains 35 characters, 25 of these including { : " " , } are informative and the actual message you send contains only 10 characters.

Let's now implement the same message using proto buffers:

```bash
syntax = "proto3";

message Identity {
    string name = 1; 
    string lastName = 2;
}
```

This is our simple proto file in which we have defined Identity message. Now let's generate js protobuf classes:

```bash
protoc --js_out=import_style=commonjs,binary:. identity.proto
```

This will provide simple accessors for each field (like `name()` and `setName()`) as well as methods to serialize/parse the whole structure to/from raw bytes.

```bash
// Serialization

var msg = new pb.Identity()

msg.setName("Peter")
msg.setLastname("Jason")

const bytes = msg.serializeBinary()
console.log(bytes)
```

After the serialisation, our 14 bytes long message in `UInt8Array` format might become the content of our **gRPC** request.

```bash
10 5 80 101 116 101 114 18 5 74 97 115 111 110
```

## Usage in Hyperledger ##

Now, that we have some basic knowledge of **gRPC and proto buffers**, we can examine how Hyperledger distributes the changes made in our chaincode asset.

Let's consider createCar function from `fabcar` chaincode:

```bash
async createCar(ctx, carNumber, make, model, color, owner) {
    console.info('============= START : Create Car ===========');

    const car = {
        color,
        docType: 'car',
        make,
        model,
        owner,
    }

    await ctx.stub.putState(carNumber,       Buffer.from(JSON.stringify(car)));
    console.info('============= END : Create Car ===========');
}
```

In the end we call `ctx.stub.putState` function. Let's take a closer look into how this function inserts a new car asset into the world state.

We are passing two arguments, record `key` and `Buffer`, which contain our car asset.

Inside the function Hyperledger uses `putState` proto buffer message with key, value and collection field.

```bash
// PutState is the payload of a ChaincodeMessage. It contains a key and value
// which needs to be written to the transactions write set. If the collection is
// specified, the key and value would be written to the transactions private
// write set.
message PutState {
   string key = 1;
   bytes value = 2;
   string collection = 3;
}
```

Next it generates js protobuf class, and sets our key and value as payload parameters, which is the part of `putState` message. We can see that we also have to specify `transactionId` and channel that we are targeting.

```bash
async handlePutState(collection, key, value, channel_id, txId) {
    const payload = new _serviceProto.PutState();
    payload.setKey(key);
    payload.setValue(value);
    payload.setCollection(collection);

    const msg = {
        type: _serviceProto.ChaincodeMessage.Type.PUT_STATE,
        payload: payload.toBuffer(),
        txid: txId,
        channel_id: channel_id
    };

    return await this._askPeerAndListen(msg, 'PutState');
}  
```  

This message is sent via **gRPC** request to the defined peers in our connection profile, and now we can start listening to the proposal responses!
